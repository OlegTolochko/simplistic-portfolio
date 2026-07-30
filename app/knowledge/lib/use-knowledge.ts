"use client";

/**
 * Data layer for the knowledge map.
 *
 * Loads /data/knowledge_graph.json, drops the unclassified ("backend") sync
 * default, and derives everything the visualisations need: adjacency, the
 * part-of DAG, a spanning tree with a single primary parent per node, per
 * domain roll-ups and review pressure.
 */

import { useEffect, useMemo, useState } from "react";
import {
  fetchKnowledgeGraphData,
  domainLabel,
  daysSinceReview,
  type KnowledgeDomain,
  type KnowledgeGraphNode,
} from "@/lib/knowledge-graph";

export type LabNode = KnowledgeGraphNode & {
  cards: number;
  due: number;
  ease?: number;
  days: number;
  /** 0 → nothing due, 1 → everything due. */
  dueRatio: number;
  /** Depth in the spanning tree (0 = domain root). */
  depth: number;
  /** Number of descendants in the spanning tree. */
  subtreeSize: number;
  /** All part-of parents (the data is a DAG, not a tree). */
  parents: string[];
  /** Children in the spanning tree. */
  kids: string[];
  /** Parents that are not the primary one — drawn as secondary links. */
  extraParents: string[];
  primaryParent: string | null;
};

export type LabLink = {
  source: string;
  target: string;
  kind: string;
  weight: number;
  crossDomain: boolean;
};

export type LabDomain = {
  domain: KnowledgeDomain;
  label: string;
  color: string;
  nodes: LabNode[];
  roots: LabNode[];
  cards: number;
  due: number;
};

export type LabGraph = {
  nodes: LabNode[];
  links: LabLink[];
  byId: Map<string, LabNode>;
  neighbors: Map<string, Set<string>>;
  domains: LabDomain[];
  /** Top-level nodes of the spanning forest, in domain order. */
  roots: LabNode[];
  maxCards: number;
  /** Distinct counts from the sync meta — node card counts overlap, because a
   *  card rolls up into every ancestor concept. */
  totals: { nodes: number; links: number; cards: number; due: number; notes: number };
  updatedAt: string;
};

/** Domains ordered the way they should read on screen (math → applications). */
const DOMAIN_ORDER: KnowledgeDomain[] = [
  "math",
  "statistics",
  "deep-learning",
  "nlp",
  "computer-vision",
  "3d-vision",
  "ml-systems",
  "infrastructure",
  "backend",
  "frontend",
];

export function useKnowledge() {
  const [raw, setRaw] = useState<Awaited<
    ReturnType<typeof fetchKnowledgeGraphData>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchKnowledgeGraphData()
      .then((d) => !cancelled && setRaw(d))
      .catch((e) => !cancelled && setError(String(e?.message ?? e)));
    return () => {
      cancelled = true;
    };
  }, []);

  const graph = useMemo<LabGraph | null>(() => {
    if (!raw) return null;

    // 1. Drop unclassified nodes and any link that pointed at them.
    const kept = raw.nodes.filter((n) => n.domain !== "backend");
    const keep = new Set(kept.map((n) => n.id));
    const links: LabLink[] = [];
    const domainOf = new Map(kept.map((n) => [n.id, n.domain]));
    for (const l of raw.links) {
      const s = l.source as string;
      const t = l.target as string;
      if (!keep.has(s) || !keep.has(t) || s === t) continue;
      links.push({
        source: s,
        target: t,
        kind: l.kind,
        weight: l.weight ?? 1,
        crossDomain: domainOf.get(s) !== domainOf.get(t),
      });
    }

    // 2. Adjacency + part-of DAG.
    const parents = new Map<string, string[]>();
    const childrenOf = new Map<string, string[]>();
    const neighbors = new Map<string, Set<string>>();
    for (const id of keep) {
      parents.set(id, []);
      childrenOf.set(id, []);
      neighbors.set(id, new Set());
    }
    for (const l of links) {
      neighbors.get(l.source)!.add(l.target);
      neighbors.get(l.target)!.add(l.source);
      if (l.kind === "part-of") {
        parents.get(l.target)!.push(l.source);
        childrenOf.get(l.source)!.push(l.target);
      }
    }

    // 3. Base node records.
    const byId = new Map<string, LabNode>();
    const nodes: LabNode[] = kept.map((n) => {
      const cards = n.anki?.totalCards ?? 0;
      const due = n.anki?.dueCards ?? 0;
      const node: LabNode = {
        ...n,
        cards,
        due,
        ease: n.anki?.avgEase,
        days: daysSinceReview(n.lastReviewed),
        dueRatio: cards > 0 ? due / cards : 0,
        depth: 0,
        subtreeSize: 0,
        parents: parents.get(n.id)!,
        kids: [],
        extraParents: [],
        primaryParent: null,
      };
      byId.set(n.id, node);
      return node;
    });

    // 4. Spanning tree: BFS from the parentless nodes. BFS order guarantees the
    //    primary-parent assignment is acyclic even though the source is a DAG.
    const rootIds = nodes
      .filter((n) => n.parents.length === 0)
      .map((n) => n.id)
      // Domain hubs first so they seed the traversal.
      .sort((a, b) => (byId.get(b)!.cards ?? 0) - (byId.get(a)!.cards ?? 0));

    const seen = new Set(rootIds);
    const queue = [...rootIds];
    while (queue.length) {
      const id = queue.shift()!;
      const me = byId.get(id)!;
      for (const c of childrenOf.get(id)!) {
        if (seen.has(c)) continue;
        seen.add(c);
        const kid = byId.get(c)!;
        kid.primaryParent = id;
        kid.depth = me.depth + 1;
        me.kids.push(c);
        queue.push(c);
      }
    }
    // Anything left unreached (cycle-only components) hangs off its domain hub.
    for (const n of nodes) {
      if (seen.has(n.id)) continue;
      const hub = byId.get(n.domain);
      seen.add(n.id);
      if (hub && hub.id !== n.id) {
        n.primaryParent = hub.id;
        n.depth = hub.depth + 1;
        hub.kids.push(n.id);
      }
    }
    for (const n of nodes) {
      n.extraParents = n.parents.filter((p) => p !== n.primaryParent);
    }

    // 5. Subtree sizes, deepest-first.
    const ordered = [...nodes].sort((a, b) => b.depth - a.depth);
    for (const n of ordered) {
      n.subtreeSize =
        1 + n.kids.reduce((s, k) => s + (byId.get(k)?.subtreeSize ?? 0), 0);
    }
    // Keep children in a stable, meaningful order: biggest branches first.
    for (const n of nodes) {
      n.kids.sort(
        (a, b) =>
          (byId.get(b)!.subtreeSize - byId.get(a)!.subtreeSize) ||
          byId.get(b)!.cards - byId.get(a)!.cards ||
          a.localeCompare(b)
      );
    }

    // 6. Domain roll-ups.
    const groups = new Map<KnowledgeDomain, LabNode[]>();
    for (const n of nodes) {
      if (!groups.has(n.domain)) groups.set(n.domain, []);
      groups.get(n.domain)!.push(n);
    }
    const domains: LabDomain[] = [...groups.entries()]
      .map(([domain, list]) => ({
        domain,
        label: domainLabel(domain),
        color: "",
        nodes: list.sort((a, b) => b.cards - a.cards),
        roots: list.filter(
          (n) => !n.primaryParent || byId.get(n.primaryParent)?.domain !== domain
        ),
        cards: list.reduce((s, n) => s + n.cards, 0),
        due: list.reduce((s, n) => s + n.due, 0),
      }))
      .sort(
        (a, b) =>
          DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain)
      );

    const roots = nodes
      .filter((n) => !n.primaryParent)
      .sort(
        (a, b) =>
          DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain) ||
          b.cards - a.cards
      );

    return {
      nodes,
      links,
      byId,
      neighbors,
      domains,
      roots,
      maxCards: Math.max(1, ...nodes.map((n) => n.cards)),
      totals: {
        nodes: nodes.length,
        links: links.length,
        notes: (raw.meta as any).noteCount ?? 0,
        cards: (raw.meta as any).cardCount ?? 0,
        due: (raw.meta as any).dueCardCount ?? 0,
      },
      updatedAt: raw.meta.updatedAt,
    };
  }, [raw]);

  return { graph, error };
}

/* ------------------------------------------------------------- utilities */

/** Ancestor chain from a node up to its root, root first. */
export function ancestryOf(graph: LabGraph, id: string): LabNode[] {
  const chain: LabNode[] = [];
  let cur = graph.byId.get(id);
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    chain.unshift(cur);
    cur = cur.primaryParent ? graph.byId.get(cur.primaryParent) : undefined;
  }
  return chain;
}

/** All descendants of a node in the spanning tree, including itself. */
export function subtreeIds(graph: LabGraph, id: string): Set<string> {
  const out = new Set<string>([id]);
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const k of graph.byId.get(cur)?.kids ?? []) {
      if (out.has(k)) continue;
      out.add(k);
      stack.push(k);
    }
  }
  return out;
}

export type SearchHit = { node: LabNode; score: number };

/** Ranked fuzzy-ish search over labels, tags and descriptions. */
export function searchNodes(
  graph: LabGraph | null,
  query: string,
  limit = 12
): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!graph || !q) return [];
  const hits: SearchHit[] = [];
  for (const node of graph.nodes) {
    const label = node.label.toLowerCase();
    let score = 0;
    if (label === q) score = 100;
    else if (label.startsWith(q)) score = 80;
    else if (label.includes(q)) score = 60;
    else if (node.tags.some((t) => t.toLowerCase().includes(q))) score = 35;
    else if (node.description?.toLowerCase().includes(q)) score = 20;
    if (!score) continue;
    hits.push({ node, score: score + Math.log10(node.cards + 1) * 4 });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Ids matching a query — used for dimming non-matches. */
export function matchSet(graph: LabGraph | null, query: string) {
  const q = query.trim().toLowerCase();
  if (!graph || !q) return null;
  const ids = new Set<string>();
  for (const n of graph.nodes) {
    if (
      n.label.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q)) ||
      n.description?.toLowerCase().includes(q)
    )
      ids.add(n.id);
  }
  return ids;
}

/** Review pressure, 0–1. Drives the "needs attention" affordances. */
export function pressure(n: LabNode) {
  const duePart = n.dueRatio * 0.65;
  const stalePart = Math.min(1, n.days / 120) * 0.25;
  const easePart = n.ease ? Math.min(1, Math.max(0, 2.5 - n.ease) / 1.2) * 0.1 : 0;
  return Math.min(1, duePart + stalePart + easePart);
}

export { domainLabel };
export type { KnowledgeDomain };
