"use client";

/**
 * Knowledge Graph (main).
 *
 * Atlas-style cluster layout with watercolor hulls and a serif aesthetic,
 * placed on the site's neutral sand background.
 *
 * Behaviour:
 *  - Unclassified ("backend") sync default is filtered out entirely.
 *  - Each domain has its own positional anchor; nodes from the same domain
 *    cluster spatially. A smoothed convex hull is drawn behind each cluster.
 *  - Small nodes (≤ 2 cards) and their incident edges are always present in
 *    the simulation but are heavily faded at low zoom; their labels only
 *    appear once the user zooms in enough to read them.
 *  - All node labels share a single weight – only the font size scales
 *    with card volume.
 *  - Strong repulsion + a wide collide radius spread the graph out so it's
 *    actually readable, even within dense clusters like NLP.
 */

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  fetchKnowledgeGraphData,
  domainLabel,
  daysSinceReview,
  type KnowledgeGraphNode,
  type KnowledgeGraphData,
  type KnowledgeDomain,
} from "@/lib/knowledge-graph";

const ForceGraph2D = dynamic(
  () =>
    import("react-force-graph-2d").catch(() => {
      return new Promise<typeof import("react-force-graph-2d")>((resolve) =>
        setTimeout(() => resolve(import("react-force-graph-2d")), 1500)
      );
    }),
  { ssr: false }
);

// Domain palette tuned to read on the sand-100 background.
const PIGMENT: Record<KnowledgeDomain, string> = {
  "deep-learning": "#7a5aa8",
  nlp: "#3a7bb1",
  "computer-vision": "#4a8f51",
  statistics: "#2a8a84",
  "ml-systems": "#3c62a0",
  backend: "#7a7565",
  frontend: "#b45a2a",
  infrastructure: "#4b4b90",
  math: "#a63b7a",
};
const pigment = (d: KnowledgeDomain) => PIGMENT[d] ?? "#7a7565";

type GN = KnowledgeGraphNode & {
  val: number;
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  _cards: number;
  _cx?: number;
  _cy?: number;
};

const SMALL = 2;             // ≤ this many cards = "minor" node
const SMALL_REVEAL_ZOOM = 1.6; // zoom at which minor nodes are fully opaque
const LABEL_REVEAL_ZOOM = 1.0; // zoom at which minor labels become visible
const CLUSTER_RADIUS = 1300;   // distance from origin to each domain anchor

const NODE_FONT_WEIGHT = 600;  // single weight – only size varies
const LABEL_COLOR = "#1a1a1a"; // plain dark – no white halo

/** Andrew's monotone chain. Returns convex hull vertices, CCW. */
function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 2) return points.slice();
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/** Chaikin corner-cutting – smooths the hull into a soft blob. */
function chaikin(points: [number, number][], iters = 3, closed = true): [number, number][] {
  let out = points;
  for (let k = 0; k < iters; k++) {
    const next: [number, number][] = [];
    const n = out.length;
    for (let i = 0; i < n; i++) {
      const p = out[i];
      const q = out[(i + 1) % n];
      if (!closed && i === n - 1) break;
      next.push([0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]]);
      next.push([0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
    }
    out = next;
  }
  return out;
}

/** Push each polygon vertex outward from centroid by `pad`. */
function expandPolygon(poly: [number, number][], pad: number): [number, number][] {
  if (poly.length < 3) return poly;
  let cx = 0, cy = 0;
  for (const [x, y] of poly) { cx += x; cy += y; }
  cx /= poly.length; cy /= poly.length;
  return poly.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const d = Math.max(1, Math.hypot(dx, dy));
    return [x + (dx / d) * pad, y + (dy / d) * pad] as [number, number];
  });
}

export default function KnowledgeGraphClient() {
  const graphRef = useRef<any>(null);
  const [active, setActive] = useState<GN | null>(null);
  const [search, setSearch] = useState("");
  const [dim, setDim] = useState({ w: 1200, h: 700 });
  const [zoom, setZoom] = useState(1);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hullsRef = useRef<{ domain: KnowledgeDomain; hull: [number, number][] }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchKnowledgeGraphData()
      .then((d) => { if (!cancelled) setGraphData(d); })
      .catch((e) => { if (!cancelled) setLoadError(e.message); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const measure = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /** Drop unclassified nodes + orphan links. */
  const cleaned = useMemo(() => {
    if (!graphData) return null;
    const nodes = graphData.nodes.filter((n) => n.domain !== "backend");
    const keep = new Set(nodes.map((n) => n.id));
    const links = graphData.links.filter(
      (l) => keep.has(l.source as string) && keep.has(l.target as string)
    );
    return { ...graphData, nodes, links };
  }, [graphData]);

  const maxCardsLog = useMemo(() => {
    if (!cleaned) return 1;
    const m = Math.max(1, ...cleaned.nodes.map((n) => n.anki?.totalCards ?? 0));
    return Math.log10(m + 1);
  }, [cleaned]);

  /** Domain anchor positions on a circle. */
  const domainCenters = useMemo(() => {
    if (!cleaned) return new Map<KnowledgeDomain, [number, number]>();
    const domains = Array.from(new Set(cleaned.nodes.map((n) => n.domain))) as KnowledgeDomain[];
    domains.sort();
    const map = new Map<KnowledgeDomain, [number, number]>();
    const n = domains.length;
    domains.forEach((d, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      map.set(d, [Math.cos(a) * CLUSTER_RADIUS, Math.sin(a) * CLUSTER_RADIUS]);
    });
    return map;
  }, [cleaned]);

  const matchIds = useMemo(() => {
    if (!cleaned) return null;
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const ids = new Set<string>();
    for (const n of cleaned.nodes) {
      if (n.label.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)))
        ids.add(n.id);
    }
    return ids;
  }, [search, cleaned]);

  const gd = useMemo(() => {
    if (!cleaned) return { nodes: [] as GN[], links: [] as any[] };
    const nodes: GN[] = cleaned.nodes.map((node) => {
      const cards = node.anki?.totalCards ?? 0;
      const t = maxCardsLog > 0 ? Math.log10(cards + 1) / maxCardsLog : 0;
      const val = 5 + t * 6;
      const [cx, cy] = domainCenters.get(node.domain) ?? [0, 0];
      return { ...node, val, color: pigment(node.domain), _cards: cards, _cx: cx, _cy: cy };
    });
    const links = cleaned.links.map((l) => ({ ...l }));
    return { nodes, links };
  }, [cleaned, maxCardsLog, domainCenters]);

  const fitView = useCallback(() => graphRef.current?.zoomToFit(700, 110), []);

  /** Tune simulation: aggressively spread nodes apart. */
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const cardsOf = (e: any) =>
      Math.max(0, typeof e === "string" ? gd.nodes.find((n) => n.id === e)?._cards ?? 0 : e?._cards ?? 0);
    const domainOf = (e: any): KnowledgeDomain | null =>
      typeof e === "string"
        ? gd.nodes.find((n) => n.id === e)?.domain ?? null
        : e?.domain ?? null;
    const isCrossDomain = (l: any) => {
      const a = domainOf(l?.source), b = domainOf(l?.target);
      return a != null && b != null && a !== b;
    };

    const linkForce = graph.d3Force("link");
    if (linkForce) {
      linkForce.distance((l: any) => {
        const s = cardsOf(l?.source), t = cardsOf(l?.target);
        const sim = Math.min(s, t) / Math.max(1, s, t);
        const bonus = l?.kind === "part-of" ? 30 + Math.log10(t + 1) * 40 : 0;
        // Cross-domain edges sit much further apart so they don't drag clusters in.
        const cross = isCrossDomain(l) ? 280 : 0;
        return Math.max(260, Math.min(900, 320 + (1 - sim) * 240 - bonus + cross));
      });
      linkForce.strength((l: any) => {
        const s = cardsOf(l?.source), t = cardsOf(l?.target);
        const sim = Math.min(s, t) / Math.max(1, s, t);
        const boost = l?.kind === "part-of" ? 0.05 + Math.log10(t + 1) * 0.06 : 0;
        const base = 0.05 + sim * 0.14 + boost;
        // Cross-domain edges are advisory only – they should not pull clusters together.
        const scaled = isCrossDomain(l) ? base * 0.18 : base;
        return Math.max(0.02, Math.min(0.4, scaled));
      });
    }

    const charge = graph.d3Force("charge");
    if (charge) charge.strength(-1900).distanceMax(2400).theta(0.85);

    const collide = graph.d3Force("collide");
    if (collide?.radius) {
      // Generous personal space – this is what kills the dense overlap.
      collide.radius((n: any) => Math.max(28, (n.val ?? 6) * 2.0) + 16).strength(1.0);
    }

    // Domain anchoring: pull each node toward its domain's anchor point.
    // Stronger pull + larger anchor radius => clusters stay distinctly separated.
    const anchorStrength = 0.18;
    graph.d3Force("domain-anchor", (alpha: number) => {
      for (const n of gd.nodes) {
        if (n._cx == null || n._cy == null) continue;
        n.vx = (n.vx ?? 0) + (n._cx - (n.x ?? 0)) * anchorStrength * alpha;
        n.vy = (n.vy ?? 0) + (n._cy - (n.y ?? 0)) * anchorStrength * alpha;
      }
    });

    graph.d3ReheatSimulation();
  }, [gd]);

  /** Recompute smoothed hulls each frame from current node positions. */
  const refreshHulls = useCallback(() => {
    const byDomain = new Map<KnowledgeDomain, [number, number][]>();
    for (const n of gd.nodes) {
      if (n.x == null || n.y == null) continue;
      if (!byDomain.has(n.domain)) byDomain.set(n.domain, []);
      byDomain.get(n.domain)!.push([n.x, n.y]);
    }
    const hulls: { domain: KnowledgeDomain; hull: [number, number][] }[] = [];
    for (const [d, pts] of byDomain.entries()) {
      if (pts.length < 3) continue;
      const hull = convexHull(pts);
      const padded = expandPolygon(hull, 56);
      const smoothed = chaikin(padded, 3, true);
      hulls.push({ domain: d, hull: smoothed });
    }
    hullsRef.current = hulls;
  }, [gd.nodes]);

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F3F0]">
        <div className="max-w-md text-center space-y-4 p-8">
          <h2 className="text-xl font-bold text-sand-900">Failed to load knowledge graph</h2>
          <p className="text-sm text-sand-700">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-sand-300 text-sand-900 text-sm font-medium border border-sand-400 hover:bg-sand-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!cleaned) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F3F0]">
        <p className="text-sand-700 text-sm italic" style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }}>
          Unfolding the atlas…
        </p>
      </div>
    );
  }

  const linkId = (end: string | any) => (typeof end === "string" ? end : end?.id);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#F3F3F0]"
      style={{ fontFamily: 'Georgia, "Iowan Old Style", "Palatino", serif' }}
    >
      <ForceGraph2D
        ref={graphRef}
        width={dim.w}
        height={dim.h}
        graphData={gd}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={4}
        minZoom={0.25}
        maxZoom={6}
        cooldownTime={6000}
        cooldownTicks={500}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.6}
        warmupTicks={80}
        onEngineStop={fitView}
        onEngineTick={refreshHulls}
        onZoom={(z: any) => setZoom(z.k ?? 1)}
        onBackgroundClick={() => setActive(null)}
        onNodeClick={(node: any) => {
          setActive(node as GN);
          graphRef.current?.centerAt(node.x ?? 0, node.y ?? 0, 600);
          graphRef.current?.zoom(2.6, 600);
        }}
        /** Watercolor hulls behind everything. */
        onRenderFramePre={(ctx: CanvasRenderingContext2D) => {
          const hulls = hullsRef.current;
          if (!hulls.length) return;
          for (const { domain, hull } of hulls) {
            if (hull.length < 3) continue;
            ctx.beginPath();
            ctx.moveTo(hull[0][0], hull[0][1]);
            for (let i = 1; i < hull.length; i++) ctx.lineTo(hull[i][0], hull[i][1]);
            ctx.closePath();
            ctx.fillStyle = hexToRgba(pigment(domain), 0.10);
            ctx.fill();
            ctx.strokeStyle = hexToRgba(pigment(domain), 0.32);
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          // Domain name watermark above each hull
          ctx.save();
          ctx.font = `italic 600 18px Georgia, "Iowan Old Style", serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          for (const { domain, hull } of hulls) {
            let cx = 0, topY = Infinity;
            for (const [x, y] of hull) { cx += x; if (y < topY) topY = y; }
            cx /= hull.length;
            ctx.fillStyle = hexToRgba(pigment(domain), 0.55);
            ctx.fillText(domainLabel(domain).toUpperCase(), cx, topY - 18);
          }
          ctx.restore();
        }}
        /** Hairline edges. Faded for minor connections. */
        linkCanvasObjectMode={() => "replace"}
        linkCanvasObject={(link: any, ctx, globalScale) => {
          const s = link.source, t = link.target;
          if (typeof s !== "object" || typeof t !== "object") return;
          const sx = s.x ?? 0, sy = s.y ?? 0, tx = t.x ?? 0, ty = t.y ?? 0;

          const sCards = (s as GN)._cards ?? 0;
          const tCards = (t as GN)._cards ?? 0;
          const minor = sCards <= SMALL || tCards <= SMALL;
          const minorFade = minor
            ? Math.max(0.05, Math.min(1, (globalScale - 0.7) / (SMALL_REVEAL_ZOOM - 0.7)))
            : 1;

          const related = link.kind === "related";
          const weight = link.weight ?? 1;
          const lineWidth = (related ? 0.6 : 1.1) + Math.log2(weight + 1) * 0.7;

          let alpha = related ? 0.22 : 0.4;
          if (matchIds) {
            const a = linkId(link.source), b = linkId(link.target);
            alpha = matchIds.has(a) && matchIds.has(b) ? (related ? 0.5 : 0.65) : 0.04;
          }
          alpha *= minorFade;

          const dx = tx - sx, dy = ty - sy;
          const len = Math.max(1, Math.hypot(dx, dy));
          const nx = -dy / len, ny = dx / len;
          const curvature = related ? 0 : Math.min(50, len * 0.08);
          const mx = (sx + tx) / 2 + nx * curvature;
          const my = (sy + ty) / 2 + ny * curvature;

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          if (curvature > 0) ctx.quadraticCurveTo(mx, my, tx, ty);
          else ctx.lineTo(tx, ty);
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = hexToRgba("#3a2f1c", alpha);
          if (related) ctx.setLineDash([4, 5]);
          ctx.stroke();
          if (related) ctx.setLineDash([]);
        }}
        nodeLabel=""
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const g = node as GN;
          const r = Math.max(4.5, g.val * 0.85);
          const x = g.x ?? 0, y = g.y ?? 0;
          const sel = active?.id === g.id;
          const isMatch = !matchIds || matchIds.has(g.id);
          const small = (g._cards ?? 0) <= SMALL;

          // Minor nodes: fade based on zoom, never fully hidden.
          const minorFade = small
            ? Math.max(0.08, Math.min(1, (globalScale - 0.7) / (SMALL_REVEAL_ZOOM - 0.7)))
            : 1;
          const baseAlpha = isMatch ? 1 : 0.18;
          const alpha = baseAlpha * minorFade;
          ctx.globalAlpha = alpha;

          // Soft outer wash
          ctx.beginPath();
          ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(g.color, 0.14);
          ctx.fill();

          // Stamp-like core
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(g.color, 0.92);
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = "#3a2f1c";
          ctx.stroke();

          if (sel) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#1a1a1a";
            ctx.beginPath();
            ctx.arc(x, y, r + 4, 0, Math.PI * 2);
            ctx.stroke();
          }

          // --- LABEL ---
          // Minor labels only show when zoomed in enough; major labels always.
          // Single weight, single color, no white halo. Only size scales.
          const cards = g._cards ?? 0;
          const isMinor = cards <= SMALL;
          const showLabel = (!isMinor || globalScale >= LABEL_REVEAL_ZOOM) || sel;
          if (showLabel) {
            const labelScale = Math.log10(cards + 1) / Math.max(1, maxCardsLog);
            const fs = Math.max(7, (8 + labelScale * 10) / globalScale);
            ctx.font = `${NODE_FONT_WEIGHT} ${fs.toFixed(1)}px Georgia, "Iowan Old Style", serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = LABEL_COLOR;

            // Label fade for minor when just barely revealed
            if (isMinor) {
              const tt = Math.max(0, Math.min(1, (globalScale - LABEL_REVEAL_ZOOM) / 0.6));
              ctx.globalAlpha = alpha * (0.25 + 0.75 * tt);
            }
            ctx.fillText(g.label, x, y + r + 5);
          }

          ctx.globalAlpha = 1;
        }}
      />

      {/* Top bar – matches the rest of the site. */}
      <div className="absolute top-4 left-4 right-4 flex items-center gap-3 pointer-events-none z-10">
        <h1 className="text-sand-900 text-xl font-bold pointer-events-auto select-none" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          Knowledge<span className="text-blue-500">.</span>
        </h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="pointer-events-auto w-full max-w-xs px-3 py-1.5 rounded-lg bg-sand-200/80 text-sand-900 text-sm placeholder:text-sand-700 border border-sand-400 focus:outline-none focus:border-sand-600 backdrop-blur-sm transition-colors"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        />
        <button
          onClick={fitView}
          className="pointer-events-auto px-3 py-1.5 rounded-lg bg-sand-200/80 text-sand-900 text-sm border border-sand-400 hover:bg-sand-300 backdrop-blur-sm transition-colors"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          Fit
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 pointer-events-none z-10">
        {Array.from(new Set(gd.nodes.map((n) => n.domain))).map((d) => (
          <span key={d} className="flex items-center gap-1.5 text-xs text-sand-800" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pigment(d as KnowledgeDomain) }} />
            {domainLabel(d)}
          </span>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 text-[11px] text-sand-700 pointer-events-none z-10 select-none" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        zoom {zoom.toFixed(2)}× · {gd.nodes.length} nodes · {gd.links.length} edges
      </div>

      {active && <DetailCard node={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function hexToRgba(hex: string, a = 1) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function DetailCard({ node, onClose }: { node: GN; onClose: () => void }) {
  const decks = (node.anki?.deck || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="absolute top-16 right-4 w-[320px] max-h-[calc(100vh-5rem)] overflow-y-auto bg-sand-140/95 backdrop-blur-lg border-2 border-sand-300 rounded-2xl p-5 z-20 text-sand-900 shadow-xl" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-sand-600 hover:text-sand-900 text-sm"
      >
        ✕
      </button>
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: pigment(node.domain) }}
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
