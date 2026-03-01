#!/usr/bin/env node

import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = path.join(ROOT, "app", "data", "knowledge_graph.json");
const DRY_RUN = process.argv.includes("--dry");

const OBSIDIAN_VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH;
const ANKI_URL = process.env.ANKI_CONNECT_URL ?? "http://127.0.0.1:8765";
const ANKI_DECK = process.env.ANKI_DECK ?? "Knowledge";

const KNOWN_DOMAINS = new Set([
  "deep-learning",
  "ml-systems",
  "backend",
  "frontend",
  "infrastructure",
  "math",
]);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ACRONYMS = new Set([
  "rnn", "cnn", "lstm", "gru", "gan", "vae", "nlp", "llm", "mlp",
  "api", "gpu", "cpu", "tpu", "sql", "css", "html", "http", "grpc",
  "svm", "pca", "rl", "rl", "ci", "cd", "aws", "gcp", "mla", "kv",
]);

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

const normalizeTag = (value) => value.replace(/^#/, "").trim();

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

const extractWikiLinks = (content) => {
  // Strip frontmatter before extracting wiki links
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
  const matches = body.match(/\[\[([^\]]+)\]\]/g) ?? [];
  return matches
    .map((item) => item.replace("[[", "").replace("]]", "").split("|")[0].trim())
    .filter(Boolean);
};

/**
 * Parse YAML frontmatter from an Obsidian markdown file.
 * Supports simple key-value pairs and a `links` array.
 *
 * Example frontmatter:
 * ---
 * description: A brief description of this topic
 * links:
 *   - https://github.com/user/repo | GitHub Project
 *   - https://arxiv.org/abs/1234.5678 | Paper
 * ---
 */
const parseFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const result = {};
  const lines = match[1].split("\n");
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // Key-value pair
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === "" || value === "|") {
        // Start of an array or multiline
        result[currentKey] = [];
        currentArray = result[currentKey];
      } else {
        result[currentKey] = value;
        currentArray = null;
      }
    } else if (currentArray !== null && line.match(/^\s+-\s+/)) {
      const item = line.replace(/^\s+-\s+/, "").trim();
      currentArray.push(item);
    }
  }

  return result;
};

/**
 * Parse a link string like "https://github.com/user/repo | GitHub Project"
 * into { url, label }.
 */
const parseLinkEntry = (entry) => {
  const parts = entry.split("|").map((s) => s.trim());
  return { url: parts[0], label: parts[1] || undefined };
};

const extractHierarchyFromAnkiTags = (tags = []) => {
  const parsed = [];

  for (const rawTag of tags) {
    const tag = normalizeTag(rawTag);
    const match = tag.match(/^kg(\d+)?::(.+)$/i);
    if (!match) continue;

    const order = match[1] ? Number(match[1]) : null;
    const concept = slugify(match[2]);
    if (!concept) continue;

    parsed.push({ order, concept });
  }

  if (parsed.length === 0) {
    return [];
  }

  const hasNumbered = parsed.some((item) => item.order !== null);

  if (!hasNumbered) {
    // No ordering — treat as flat list, single level
    const seen = new Set();
    const flat = parsed.filter((p) => {
      if (seen.has(p.concept)) return false;
      seen.add(p.concept);
      return true;
    });
    return [flat.map((p) => p.concept)];
  }

  // Group by order number — concepts at the same level become siblings
  const levelMap = new Map();
  for (const p of parsed) {
    const level = p.order ?? 999;
    if (!levelMap.has(level)) levelMap.set(level, []);
    const arr = levelMap.get(level);
    if (!arr.includes(p.concept)) arr.push(p.concept);
  }

  // Sort levels ascending and return as array of arrays
  return Array.from(levelMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, concepts]) => concepts);
};

const normalizeDomain = (value) => {
  if (!value) return "backend";
  if (value === "infra") return "infrastructure";
  if (value === "dl") return "deep-learning";
  if (KNOWN_DOMAINS.has(value)) return value;
  return "backend";
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

const aggregateAnkiByConcept = async () => {
  const noteIds = await callAnki("findNotes", { query: `deck:\"${ANKI_DECK}\"` });
  if (!Array.isArray(noteIds) || noteIds.length === 0) {
    return { nodeMap: new Map(), links: [] };
  }

  const notesInfo = await callAnki("notesInfo", { notes: noteIds });

  const allCardIds = notesInfo.flatMap((note) => note.cards ?? []);
  const dueCardIds = await callAnki("findCards", { query: `deck:\"${ANKI_DECK}\" is:due` });
  const dueSet = new Set(Array.isArray(dueCardIds) ? dueCardIds : []);

  const cardsInfo = allCardIds.length
    ? await callAnki("cardsInfo", { cards: allCardIds })
    : [];

  const cardMap = new Map(cardsInfo.map((card) => [card.cardId, card]));
  const nodeMap = new Map();
  const linkMap = new Map();

  const addNodeStatsFromCard = (conceptId, card) => {
    const current = nodeMap.get(conceptId) ?? {
      totalCards: 0,
      dueCards: 0,
      easeSum: 0,
      easeCount: 0,
      latestMod: 0,
      deckNames: new Set(),
      domainVotes: new Map(),
      hierarchyAppearances: 0,
    };

    current.totalCards += 1;
    if (dueSet.has(card.cardId)) {
      current.dueCards += 1;
    }
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

    nodeMap.set(conceptId, current);
  };

  for (const note of notesInfo) {
    const levels = extractHierarchyFromAnkiTags(note.tags ?? []);
    if (levels.length === 0) continue;

    const allConcepts = levels.flat();
    const rootDomain = normalizeDomain(levels[0][0]);

    for (const conceptId of allConcepts) {
      const current = nodeMap.get(conceptId) ?? {
        totalCards: 0,
        dueCards: 0,
        easeSum: 0,
        easeCount: 0,
        latestMod: 0,
        deckNames: new Set(),
        domainVotes: new Map(),
        hierarchyAppearances: 0,
      };

      const currentVotes = current.domainVotes.get(rootDomain) ?? 0;
      current.domainVotes.set(rootDomain, currentVotes + 1);
      current.hierarchyAppearances += 1;
      nodeMap.set(conceptId, current);
    }

    // Build links between adjacent levels.
    // Each concept at level N connects to every concept at level N+1,
    // enabling multi-parent relationships naturally.
    for (let i = 0; i < levels.length - 1; i += 1) {
      for (const parentId of levels[i]) {
        for (const childId of levels[i + 1]) {
          const edgeKey = `${parentId}->${childId}:part-of`;
          const previous = linkMap.get(edgeKey) ?? {
            source: parentId,
            target: childId,
            kind: "part-of",
            weight: 0,
          };
          previous.weight += 1;
          linkMap.set(edgeKey, previous);
        }
      }
    }

    for (const cardId of note.cards ?? []) {
      const card = cardMap.get(cardId);
      if (!card) continue;

      for (const conceptId of allConcepts) {
        addNodeStatsFromCard(conceptId, card);
      }
    }
  }

  return {
    nodeMap,
    links: Array.from(linkMap.values()),
  };
};

const buildObsidianIndex = async () => {
  if (!OBSIDIAN_VAULT_PATH) {
    return {
      fileById: new Map(),
      links: [],
    };
  }

  const markdownFiles = await walkMarkdownFiles(OBSIDIAN_VAULT_PATH);
  const fileById = new Map();
  const links = [];

  const titleToId = new Map();
  for (const filePath of markdownFiles) {
    const title = path.basename(filePath, ".md");
    const id = slugify(title);
    titleToId.set(title, id);
    fileById.set(id, {
      path: path.relative(OBSIDIAN_VAULT_PATH, filePath),
      title,
    });
  }

  for (const filePath of markdownFiles) {
    const content = await readFile(filePath, "utf8");
    const title = path.basename(filePath, ".md");
    const id = slugify(title);

    // Parse frontmatter for description and links
    const fm = parseFrontmatter(content);
    const existing = fileById.get(id);
    if (existing) {
      if (fm.description) existing.description = fm.description;
      if (Array.isArray(fm.links) && fm.links.length > 0) {
        existing.links = fm.links.map(parseLinkEntry);
      }
    }

    const rawLinks = extractWikiLinks(content);
    for (const rawTarget of rawLinks) {
      const cleanTarget = rawTarget.replace(/\.md$/i, "");
      const targetId = titleToId.get(cleanTarget) ?? slugify(cleanTarget);
      if (targetId === id) continue;
      links.push({
        source: id,
        target: targetId,
        kind: "related",
        weight: 1,
      });
    }
  }

  return { fileById, links };
};

const dedupeLinks = (links) => {
  const seen = new Set();
  const result = [];

  for (const link of links) {
    const key = `${link.source}->${link.target}:${link.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(link);
  }

  return result;
};

const main = async () => {
  let ankiResult = { nodeMap: new Map(), links: [] };
  try {
    ankiResult = await aggregateAnkiByConcept();
  } catch (error) {
    console.warn("Anki sync failed:", error.message);
    throw error;
  }

  const obsidianIndex = await buildObsidianIndex();

  const nodes = Array.from(ankiResult.nodeMap.entries()).map(([id, stats]) => {
    const sortedVotes = Array.from(stats.domainVotes.entries()).sort((a, b) => b[1] - a[1]);
    const derivedDomain = normalizeDomain(sortedVotes[0]?.[0]);
    const obsidian = obsidianIndex.fileById.get(id);

    return {
      id,
      label: obsidian?.title ?? titleCaseFromSlug(id),
      domain: derivedDomain,
      lastReviewed:
        stats.latestMod > 0
          ? new Date(stats.latestMod).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      tags: [`kg::${id}`],
      obsidianPath: obsidian?.path,
      description: obsidian?.description,
      links: obsidian?.links,
      anki: {
        totalCards: stats.totalCards,
        dueCards: stats.dueCards,
        deck: Array.from(stats.deckNames).sort().join(", "),
        avgEase: stats.easeCount ? Number((stats.easeSum / stats.easeCount).toFixed(2)) : undefined,
      },
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const obsidianLinks = obsidianIndex.links.filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
  );

  const output = {
    meta: {
      source: "anki-hierarchy+obsidian-enrichment",
      updatedAt: new Date().toISOString(),
    },
    nodes,
    links: dedupeLinks([...ankiResult.links, ...obsidianLinks]).filter(
      (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
    ),
  };

  if (DRY_RUN) {
    console.log(`Dry run: ${nodes.length} nodes, ${output.links.length} links.`);
    return;
  }

  await writeFile(TARGET, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`Knowledge graph synced: ${nodes.length} nodes, ${output.links.length} links.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
