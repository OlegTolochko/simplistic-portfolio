"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  knowledgeGraphData,
  domainColor,
  domainColorWithEase,
  domainLabel,
  daysSinceReview,
  type KnowledgeGraphNode,
} from "@/lib/knowledge-graph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type GN = KnowledgeGraphNode & { val: number; color: string; x?: number; y?: number };

/* Find the max totalCards across all nodes for normalized scaling */
const maxCards = Math.max(
  1,
  ...knowledgeGraphData.nodes.map((n) => n.anki?.totalCards ?? 0)
);
const maxCardsLog = Math.log10(maxCards + 1);

export default function KnowledgeGraphClient() {
  const graphRef = useRef<any>(null);
  const [active, setActive] = useState<GN | null>(null);
  const [search, setSearch] = useState("");
  const [dim, setDim] = useState({ w: 1200, h: 700 });

  useEffect(() => {
    const measure = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* IDs matching the search — null means "no filter" */
  const matchIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const ids = new Set<string>();
    for (const n of knowledgeGraphData.nodes) {
      if (
        n.label.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      )
        ids.add(n.id);
    }
    return ids;
  }, [search]);

  /* Always keep all nodes/links — dim non-matches instead of removing */
  const gd = useMemo(() => {
    const nodes: GN[] = knowledgeGraphData.nodes.map((node) => {
      const cards = node.anki?.totalCards ?? 0;
      // Scale radius with capped logarithmic growth so large decks don't dominate.
      // ~0-5 cards get visible separation; 50-500+ cards grow slowly.
      const t = maxCardsLog > 0 ? Math.log10(cards + 1) / maxCardsLog : 0;
      const val = 5.5 + t * 5.5;
      const color = domainColorWithEase(node.domain, node.anki?.avgEase);
      return { ...node, val, color };
    });
    const links = knowledgeGraphData.links.map((l) => ({ ...l }));
    return { nodes, links };
  }, []);

  const fitView = useCallback(() => graphRef.current?.zoomToFit(500, 80), []);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const linkForce = graph.d3Force("link");
    if (linkForce) {
      const nodeCards = (nodeLike: any) => {
        const node = typeof nodeLike === "string" ? gd.nodes.find((n) => n.id === nodeLike) : nodeLike;
        return Math.max(0, node?.anki?.totalCards ?? 0);
      };

      linkForce.distance((link: any) => {
        const weight = link?.weight ?? 1;
        const sourceCards = nodeCards(link?.source);
        const targetCards = nodeCards(link?.target);

        // Similar card volumes => more related => shorter distance.
        // Large mismatch => longer distance to reduce visual tangling.
        const maxCards = Math.max(1, sourceCards, targetCards);
        const minCards = Math.min(sourceCards, targetCards);
        const similarity = minCards / maxCards; // 0..1
        const mismatch = 1 - similarity;

        const weightedBonus = Math.log2(weight + 1) * 18;
        const distance = 180 + mismatch * 230 - weightedBonus;
        return Math.max(160, Math.min(420, distance));
      });
      linkForce.strength((link: any) => {
        const sourceCards = nodeCards(link?.source);
        const targetCards = nodeCards(link?.target);
        const maxCards = Math.max(1, sourceCards, targetCards);
        const minCards = Math.min(sourceCards, targetCards);
        const similarity = minCards / maxCards;
        const weight = link?.weight ?? 1;

        // Similar + higher weight edges pull stronger.
        return Math.max(0.06, Math.min(0.42, 0.09 + similarity * 0.22 + Math.log2(weight + 1) * 0.04));
      });
    }

    const chargeForce = graph.d3Force("charge");
    if (chargeForce) {
      chargeForce.strength(-620);
    }

    graph.d3ReheatSimulation();
  }, [gd]);

  const linkId = (end: string | any) => (typeof end === "string" ? end : end?.id);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F3F3F0]">
      <ForceGraph2D
        ref={graphRef}
        width={dim.w}
        height={dim.h}
        graphData={gd}
        backgroundColor="#F3F3F0"
        nodeRelSize={4}
        linkWidth={(l: any) => 1.8 + Math.log2((l.weight ?? 1) + 1) * 1.2}
        linkColor={(l: any) => {
          const isRelated = l.kind === "related";

          if (!matchIds) {
            return isRelated ? "rgba(120,130,145,0.30)" : "rgba(157,157,133,0.42)";
          }

          const s = linkId(l.source), t = linkId(l.target);
          if (matchIds.has(s) && matchIds.has(t)) {
            return isRelated ? "rgba(98,112,128,0.45)" : "rgba(100,100,80,0.55)";
          }

          return isRelated ? "rgba(120,130,145,0.10)" : "rgba(157,157,133,0.12)";
        }}
        linkLineDash={(l: any) => (l.kind === "related" ? [6, 6] : null)}
        linkDirectionalParticles={(l: any) => (l.kind === "part-of" ? 1 : 0)}
        linkDirectionalParticleWidth={3.2}
        linkDirectionalParticleColor={() => "rgba(157,157,133,0.35)"}
        nodeLabel=""
        cooldownTime={2000}
        d3AlphaDecay={0.04}
        d3VelocityDecay={0.32}
        warmupTicks={25}
        onEngineStop={fitView}
        onBackgroundClick={() => setActive(null)}
        onNodeClick={(node: any) => {
          setActive(node as GN);
          graphRef.current?.centerAt(node.x ?? 0, node.y ?? 0, 500);
          graphRef.current?.zoom(2.6, 500);
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const g = node as GN;
          const r = Math.max(5, g.val * 0.85);
          const x = g.x ?? 0, y = g.y ?? 0;
          const sel = active?.id === g.id;
          const isMatch = !matchIds || matchIds.has(g.id);
          const alpha = isMatch ? 1 : 0.15;

          ctx.globalAlpha = alpha;

          // soft glow – solid fill is ~10× cheaper than createRadialGradient per frame
          ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, 2 * Math.PI);
          ctx.fillStyle = g.color + (sel ? "30" : "10");
          ctx.fill();

          // core
          ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI);
          ctx.fillStyle = g.color; ctx.fill();
          if (sel) { ctx.lineWidth = 2.5; ctx.strokeStyle = "#374151"; ctx.stroke(); }

          // label – reuse cached font string to avoid parsing on every frame
          const cards = g.anki?.totalCards ?? 0;
          const labelScale = maxCardsLog > 0 ? Math.log10(cards + 1) / maxCardsLog : 0;
          const labelBase = 6 + labelScale * 10;
          const fs = Math.max(6, labelBase / globalScale);
          const fontWeight = Math.round(420 + labelScale * 330);
          // only rebuild font when scale changes meaningfully (floor to .5px)
          const fsKey = (Math.round(fs * 2) / 2).toFixed(1);
          const fontKey = `${fontWeight}_${fsKey}`;
          if ((g as any).__fontKey !== fontKey) {
            (g as any).__fontKey = fontKey;
            (g as any).__font = `${fontWeight} ${fsKey}px Inter, system-ui, sans-serif`;
          }
          ctx.font = (g as any).__font;
          ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillStyle = "#374151";
          ctx.fillText(g.label, x, y + r + 4);

          ctx.globalAlpha = 1;
        }}
      />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center gap-3 pointer-events-none z-10">
        <h1 className="text-sand-900 text-xl font-bold pointer-events-auto select-none">
          Knowledge<span className="text-blue-500">.</span>
        </h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="pointer-events-auto w-full max-w-xs px-3 py-1.5 rounded-lg bg-sand-200/80 text-sand-900 text-sm placeholder:text-sand-700 border border-sand-400 focus:outline-none focus:border-sand-600 backdrop-blur-sm transition-colors"
        />
        <button
          onClick={fitView}
          className="pointer-events-auto px-3 py-1.5 rounded-lg bg-sand-200/80 text-sand-900 text-sm border border-sand-400 hover:bg-sand-300 backdrop-blur-sm transition-colors"
        >
          Fit
        </button>
      </div>

      {/* Domain legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pointer-events-none z-10">
        {Array.from(new Set(knowledgeGraphData.nodes.map((n) => n.domain))).map((d) => (
          <span key={d} className="flex items-center gap-1.5 text-xs text-sand-800">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: domainColor(d) }} />
            {domainLabel(d)}
          </span>
        ))}
      </div>

      {/* Floating detail card */}
      {active && <DetailCard node={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function DetailCard({ node, onClose }: { node: GN; onClose: () => void }) {
  const decks = (node.anki?.deck || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="absolute top-16 right-4 w-[320px] max-h-[calc(100vh-5rem)] overflow-y-auto bg-sand-140/95 backdrop-blur-lg border-2 border-sand-300 rounded-2xl p-5 z-20 text-sand-900 shadow-xl">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-sand-600 hover:text-sand-900 text-sm"
      >
        ✕
      </button>
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: domainColorWithEase(node.domain, node.anki?.avgEase) }}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-sand-700">
          {domainLabel(node.domain)}
        </span>
      </div>
      <h2 className="text-xl font-bold mt-2">{node.label}</h2>

      {node.description && (
        <p className="mt-2 text-sm text-sand-800 leading-relaxed">{node.description}</p>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Last reviewed" value={`${node.lastReviewed} (${daysSinceReview(node.lastReviewed)}d)`} />
        <Row label="Cards" value={`${node.anki?.totalCards ?? 0} total · ${node.anki?.dueCards ?? 0} due`} />
        <Row label="Avg ease" value={node.anki?.avgEase?.toFixed(2) ?? "—"} />
      </dl>

      {decks.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-sand-700 mb-1.5">
            {decks.length === 1 ? "Deck" : "Decks"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {decks.map((d) => (
              <span key={d} className="px-2 py-0.5 rounded-md bg-sand-200 text-[11px] font-medium text-sand-800 border border-sand-300">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {node.links && node.links.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sand-600 mb-2">Links</h3>
          <div className="space-y-1.5">
            {node.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {link.label || link.url}
              </a>
            ))}
          </div>
        </div>
      )}

      {node.obsidianPath && (
        <p className="mt-3 text-[11px] text-sand-600 break-all">{node.obsidianPath}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {node.tags.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-sand-300 text-[11px] font-medium text-sand-800">{t}</span>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-sand-300 pb-1">
      <dt className="text-sand-700">{label}</dt>
      <dd className="text-sand-900">{value}</dd>
    </div>
  );
}
