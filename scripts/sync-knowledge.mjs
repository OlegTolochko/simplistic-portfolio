#!/usr/bin/env node

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = path.join(ROOT, "app", "data", "knowledge_graph.json");
const STRUCTURE_PATH =
  process.env.KNOWLEDGE_STRUCTURE_PATH ??
  path.join(ROOT, "app", "data", "knowledge_structure.json");

const DRY_RUN = process.argv.includes("--dry");

const OBSIDIAN_VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH;
const OBSIDIAN_KNOWLEDGE_DIR = process.env.OBSIDIAN_KNOWLEDGE_DIR ?? "Knowledge";
const ANKI_URL = process.env.ANKI_CONNECT_URL ?? "http://127.0.0.1:8765";
const ANKI_DECK = process.env.ANKI_DECK ?? "Knowledge";

const KNOWN_DOMAINS = new Set([
  "deep-learning",
  "nlp",
  "computer-vision",
  "ml-systems",
  "backend",
  "frontend",
  "infrastructure",
  "math",
  "statistics",
]);

const ACRONYMS = new Set([
  "rnn",
  "cnn",
  "lstm",
  "gru",
  "gan",
  "vae",
  "nlp",
  "llm",
  "mlp",
  "bert",
  "gpt",
  "api",
  "gpu",
  "cpu",
  "tpu",
  "sql",
  "css",
  "html",
  "http",
  "grpc",
  "svm",
  "pca",
  "rl",
  "ci",
  "cd",
  "aws",
  "gcp",
  "mla",
  "kv",
]);

const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeTag = (value = "") => value.replace(/^#/, "").trim();

const titleCaseFromSlug = (value) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) =>
      ACRONYMS.has(part.toLowerCase())
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");

const normalizeDomain = (value) => {
  if (!value) return "backend";
  const normalized = slugify(value);
  if (normalized === "infra") return "infrastructure";
  if (normalized === "dl") return "deep-learning";
  if (KNOWN_DOMAINS.has(normalized)) return normalized;
  return "backend";
};

const emptyNodeStats = () => ({
  totalCards: 0,
  dueCards: 0,
  easeSum: 0,
  easeCount: 0,
  latestMod: 0,
  deckNames: new Set(),
  domainVotes: new Map(),
  hierarchyAppearances: 0,
});

const ensureNodeStats = (nodeMap, conceptId) => {
  if (!nodeMap.has(conceptId)) {
    nodeMap.set(conceptId, emptyNodeStats());
  }
  return nodeMap.get(conceptId);
};

const fileExists = async (targetPath) => {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
};

const walkMarkdownFiles = async (dirPath) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
};

const parseFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const result = {};
  const lines = match[1].split("\n");
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === "") {
        result[currentKey] = [];
        currentArray = result[currentKey];
      } else {
        result[currentKey] = value;
        currentArray = null;
      }
    } else if (currentArray !== null && line.match(/^\s+-\s+/)) {
      currentArray.push(line.replace(/^\s+-\s+/, "").trim());
    }
  }

  return result;
};

const extractWikiLinks = (content) => {
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
  const matches = body.match(/\[\[([^\]]+)\]\]/g) ?? [];
  return matches
    .map((item) => item.replace("[[", "").replace("]]", "").split("|")[0].trim())
    .filter(Boolean);
};

const parseLinkEntry = (entry) => {
  const parts = String(entry)
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    url: parts[0],
    label: parts[1] || undefined,
  };
};

const addWeightedLink = (linkMap, { source, target, kind = "related", weight = 1 }) => {
  if (!source || !target || source === target) return;
  const edgeKey = `${source}->${target}:${kind}`;
  const previous = linkMap.get(edgeKey) ?? {
    source,
    target,
    kind,
    weight: 0,
  };
  previous.weight += weight;
  linkMap.set(edgeKey, previous);
};

const collapseLinks = (links) => {
  const linkMap = new Map();
  for (const link of links) addWeightedLink(linkMap, link);
  return Array.from(linkMap.values());
};

const extractTagBuckets = (tags = []) => {
  const conceptTags = new Set();
  const contextTags = new Set();

  for (const rawTag of tags) {
    const tag = normalizeTag(rawTag);

    const conceptMatch = tag.match(/^kg::(.+)$/i);
    if (conceptMatch) {
      const conceptId = slugify(conceptMatch[1]);
      if (conceptId) conceptTags.add(conceptId);
      continue;
    }

    const contextMatch = tag.match(/^ctx::(.+)$/i);
    if (contextMatch) {
      const contextId = slugify(contextMatch[1]);
      if (contextId) contextTags.add(contextId);
      continue;
    }
  }

  return {
    conceptTags,
    contextTags,
  };
};

const callAnki = async (action, params = {}) => {
  const response = await fetch(ANKI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, version: 6, params }),
  });

  const body = await response.json();
  if (body.error) {
    throw new Error(`AnkiConnect error on ${action}: ${body.error}`);
  }
  return body.result;
};

const loadStructure = async () => {
  if (!(await fileExists(STRUCTURE_PATH))) {
    return {
      conceptById: new Map(),
      links: [],
      source: "none",
    };
  }

  const content = await readFile(STRUCTURE_PATH, "utf8");
  const raw = JSON.parse(content);

  const conceptById = new Map();
  const links = [];

  for (const concept of raw.concepts ?? []) {
    const id = slugify(concept.id ?? concept.label ?? "");
    if (!id) continue;

    const nodeConfig = {
      id,
      label: concept.label,
      domain: concept.domain ? normalizeDomain(concept.domain) : undefined,
      description: concept.description,
      obsidianPath: concept.obsidianPath,
      links: Array.isArray(concept.links)
        ? concept.links.map(parseLinkEntry).filter((link) => link.url)
        : undefined,
      parents: Array.isArray(concept.parents)
        ? concept.parents.map((parent) => slugify(parent)).filter(Boolean)
        : [],
    };

    conceptById.set(id, nodeConfig);
  }

  for (const [id, concept] of conceptById.entries()) {
    for (const parentId of concept.parents) {
      links.push({
        source: parentId,
        target: id,
        kind: "part-of",
        weight: 1,
      });
    }
  }

  for (const edge of raw.edges ?? []) {
    const source = slugify(edge.source);
    const target = slugify(edge.target);
    if (!source || !target) continue;
    links.push({
      source,
      target,
      kind: edge.kind ?? "related",
      weight: Number(edge.weight ?? 1),
    });
  }

  return {
    conceptById,
    links: collapseLinks(links),
    source: STRUCTURE_PATH,
  };
};

const aggregateAnkiByConcept = async (structure) => {
  const noteIds = await callAnki("findNotes", { query: `deck:\"${ANKI_DECK}\"` });
  if (!Array.isArray(noteIds) || noteIds.length === 0) {
    return { nodeMap: new Map(), links: [] };
  }

  const notesInfo = await callAnki("notesInfo", { notes: noteIds });

  const allCardIds = notesInfo.flatMap((note) => note.cards ?? []);
  const dueCardIds = await callAnki("findCards", {
    query: `deck:\"${ANKI_DECK}\" is:due`,
  });
  const dueSet = new Set(Array.isArray(dueCardIds) ? dueCardIds : []);

  const cardsInfo = allCardIds.length
    ? await callAnki("cardsInfo", { cards: allCardIds })
    : [];

  const cardMap = new Map(cardsInfo.map((card) => [card.cardId, card]));

  const directCardsByConcept = new Map();

  const addCardToConcept = (conceptId, cardId) => {
    if (!directCardsByConcept.has(conceptId)) {
      directCardsByConcept.set(conceptId, new Set());
    }
    directCardsByConcept.get(conceptId).add(cardId);
  };

  for (const note of notesInfo) {
    const { conceptTags, contextTags } = extractTagBuckets(note.tags ?? []);

    const conceptIds = Array.from(new Set([...conceptTags, ...contextTags]));
    if (conceptIds.length === 0) continue;

    for (const cardId of note.cards ?? []) {
      for (const conceptId of conceptIds) {
        addCardToConcept(conceptId, cardId);
      }
    }
  }

  const parentsByChild = new Map();
  for (const [id, concept] of structure.conceptById.entries()) {
    parentsByChild.set(id, concept.parents ?? []);
  }

  const ancestorMemo = new Map();
  const getAncestors = (conceptId, stack = new Set()) => {
    if (ancestorMemo.has(conceptId)) return ancestorMemo.get(conceptId);
    if (stack.has(conceptId)) return [];

    stack.add(conceptId);
    const parents = parentsByChild.get(conceptId) ?? [];
    const ancestors = new Set(parents);

    for (const parentId of parents) {
      for (const grandParent of getAncestors(parentId, stack)) {
        ancestors.add(grandParent);
      }
    }

    stack.delete(conceptId);
    const result = Array.from(ancestors);
    ancestorMemo.set(conceptId, result);
    return result;
  };

  const rolledUpCardsByConcept = new Map();
  for (const [conceptId, cards] of directCardsByConcept.entries()) {
    if (!rolledUpCardsByConcept.has(conceptId)) {
      rolledUpCardsByConcept.set(conceptId, new Set());
    }

    for (const cardId of cards) {
      rolledUpCardsByConcept.get(conceptId).add(cardId);
    }

    for (const ancestorId of getAncestors(conceptId)) {
      if (!rolledUpCardsByConcept.has(ancestorId)) {
        rolledUpCardsByConcept.set(ancestorId, new Set());
      }
      for (const cardId of cards) {
        rolledUpCardsByConcept.get(ancestorId).add(cardId);
      }
    }
  }

  const nodeMap = new Map();
  for (const [conceptId, cardIds] of rolledUpCardsByConcept.entries()) {
    const current = ensureNodeStats(nodeMap, conceptId);
    current.hierarchyAppearances += cardIds.size;

    const structureDomain = structure.conceptById.get(conceptId)?.domain;
    if (structureDomain) {
      current.domainVotes.set(structureDomain, cardIds.size);
    }

    for (const cardId of cardIds) {
      const card = cardMap.get(cardId);
      if (!card) continue;

      current.totalCards += 1;
      if (dueSet.has(card.cardId)) current.dueCards += 1;

      if (typeof card.factor === "number" && card.factor > 0) {
        current.easeSum += card.factor / 1000;
        current.easeCount += 1;
      }
      if (typeof card.mod === "number") {
        current.latestMod = Math.max(current.latestMod, card.mod * 1000);
      }
      if (card.deckName) {
        current.deckNames.add(card.deckName);
      }
    }
  }

  return {
    nodeMap,
    links: [],
  };
};

const buildObsidianIndex = async () => {
  if (!OBSIDIAN_VAULT_PATH) {
    return {
      fileById: new Map(),
      links: [],
      sourcePath: null,
    };
  }

  const preferredPath = path.join(OBSIDIAN_VAULT_PATH, OBSIDIAN_KNOWLEDGE_DIR);
  const basePath = (await fileExists(preferredPath))
    ? preferredPath
    : OBSIDIAN_VAULT_PATH;

  const markdownFiles = await walkMarkdownFiles(basePath);
  const fileById = new Map();
  const links = [];
  const titleToId = new Map();

  const records = [];
  for (const filePath of markdownFiles) {
    const content = await readFile(filePath, "utf8");
    const fm = parseFrontmatter(content);
    const title = path.basename(filePath, ".md");
    const id = slugify(fm.id ?? title);

    if (!id) continue;

    records.push({ filePath, content, fm, title, id });
    titleToId.set(title, id);
    titleToId.set(id, id);

    fileById.set(id, {
      path: path.relative(OBSIDIAN_VAULT_PATH, filePath),
      title,
      domain: fm.domain ? normalizeDomain(fm.domain) : undefined,
      description: fm.description,
      links: Array.isArray(fm.links)
        ? fm.links.map(parseLinkEntry).filter((entry) => entry.url)
        : undefined,
      parents: Array.isArray(fm.parents)
        ? fm.parents.map((parent) => slugify(parent)).filter(Boolean)
        : [],
    });
  }

  for (const record of records) {
    const id = record.id;

    for (const parentId of fileById.get(id)?.parents ?? []) {
      links.push({
        source: parentId,
        target: id,
        kind: "part-of",
        weight: 1,
      });
    }

    const rawLinks = extractWikiLinks(record.content);
    for (const rawTarget of rawLinks) {
      const cleanTarget = rawTarget.replace(/\.md$/i, "");
      const targetId = titleToId.get(cleanTarget) ?? slugify(cleanTarget);
      if (!targetId || targetId === id) continue;
      links.push({
        source: id,
        target: targetId,
        kind: "related",
        weight: 1,
      });
    }
  }

  return {
    fileById,
    links: collapseLinks(links),
    sourcePath: basePath,
  };
};

const mergeNodeLinks = (...linkLists) => {
  const merged = [];
  for (const list of linkLists) {
    for (const item of list ?? []) {
      const parsed = typeof item === "string" ? parseLinkEntry(item) : item;
      if (!parsed?.url) continue;
      merged.push({ url: parsed.url, label: parsed.label });
    }
  }

  const seen = new Set();
  return merged.filter((item) => {
    const key = `${item.url}|${item.label ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const main = async () => {
  const structure = await loadStructure();
  const [ankiResult, obsidianIndex] = await Promise.all([
    aggregateAnkiByConcept(structure),
    buildObsidianIndex(),
  ]);

  const allIds = new Set();
  for (const id of structure.conceptById.keys()) allIds.add(id);
  for (const id of ankiResult.nodeMap.keys()) allIds.add(id);
  for (const link of structure.links) {
    allIds.add(link.source);
    allIds.add(link.target);
  }

  const today = new Date().toISOString().slice(0, 10);
  const nodes = Array.from(allIds).map((id) => {
    const stats = ankiResult.nodeMap.get(id) ?? emptyNodeStats();
    const structureNode = structure.conceptById.get(id);
    const obsidianNode = obsidianIndex.fileById.get(id);

    const sortedVotes = Array.from(stats.domainVotes.entries()).sort((a, b) => b[1] - a[1]);
    const derivedDomain =
      structureNode?.domain ??
      obsidianNode?.domain ??
      normalizeDomain(sortedVotes[0]?.[0] ?? id);

    const mergedLinks = mergeNodeLinks(structureNode?.links, obsidianNode?.links);

    return {
      id,
      label: structureNode?.label ?? obsidianNode?.title ?? titleCaseFromSlug(id),
      domain: derivedDomain,
      lastReviewed:
        stats.latestMod > 0 ? new Date(stats.latestMod).toISOString().slice(0, 10) : today,
      tags: [`kg::${id}`],
      obsidianPath: structureNode?.obsidianPath ?? obsidianNode?.path,
      description: structureNode?.description ?? obsidianNode?.description,
      links: mergedLinks.length > 0 ? mergedLinks : undefined,
      anki: {
        totalCards: stats.totalCards,
        dueCards: stats.dueCards,
        deck: Array.from(stats.deckNames).sort().join(", "),
        avgEase: stats.easeCount
          ? Number((stats.easeSum / stats.easeCount).toFixed(2))
          : undefined,
      },
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));

  const combinedLinks = collapseLinks(structure.links).filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
  );

  const output = {
    meta: {
      source: "anki-concepts+structure-only-edges+obsidian-enrichment",
      updatedAt: new Date().toISOString(),
      structurePath: structure.source,
      obsidianPath: obsidianIndex.sourcePath,
      nodeCount: nodes.length,
      linkCount: combinedLinks.length,
    },
    nodes,
    links: combinedLinks,
  };

  if (DRY_RUN) {
    console.log(`Dry run: ${nodes.length} nodes, ${combinedLinks.length} links.`);
    return;
  }

  await writeFile(TARGET, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`Knowledge graph synced: ${nodes.length} nodes, ${combinedLinks.length} links.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
