"use client";

/**
 * The knowledge map.
 *
 * Nothing here is simulated: the map is composed. Every concept sits on a ring
 * set by its depth in the part-of hierarchy, and every domain owns a fixed
 * angular sector, so the layout is identical every time the page opens —
 * nothing drifts, nothing overlaps, and a concept is always where you left it.
 *
 *  - Rings = how specific a concept is. The first ring holds the domains, the
 *    outermost ring the leaf material you actually drill on.
 *  - Sectors = domains, named on a curved outer band. A domain nested inside
 *    another one gets its own concentric inner band.
 *  - The hierarchy is really a DAG; the second parents live on their own
 *    toggleable layer of faint chords across the centre, so cross-domain
 *    structure stays visible without polluting the skeleton.
 *  - Hovering lights the whole path back to the centre; clicking flies the
 *    camera to that branch and opens its detail panel.
 *
 * Data comes from /data/knowledge_graph.json, produced by
 * scripts/sync-knowledge.mjs out of Anki + app/data/knowledge_structure.json.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SAND,
  SANS,
  SERIF,
  clamp,
  darken,
  lighten,
  pigment,
  rgba,
} from "./lib/theme";
import {
  ancestryOf,
  domainLabel,
  matchSet,
  pressure,
  subtreeIds,
  useKnowledge,
  type LabNode,
} from "./lib/use-knowledge";
import { usePanZoom } from "./lib/use-pan-zoom";
import {
  MapError,
  MapLoading,
  NodeDetail,
  SearchField,
} from "./lib/ui";

type Placed = {
  node: LabNode;
  angle: number; // radians, 0 = up
  radius: number;
  x: number;
  y: number;
  a0: number; // sector start
  a1: number; // sector end
};

const RINGS = [210, 400, 565, 705, 830, 940, 1040];
const ringRadius = (d: number) =>
  d < RINGS.length
    ? RINGS[d]
    : RINGS[RINGS.length - 1] + (d - RINGS.length + 1) * 95;
const GAP_LEAVES = 2.6; // angular padding between domains, in leaf units

export default function KnowledgeMap() {
  const { graph, error } = useKnowledge();
  const { hostRef, transform, size, fit, focusOn, zoomBy, wasDragged } =
    usePanZoom({ minK: 0.12, maxK: 6 });

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [maxDepth, setMaxDepth] = useState(9);
  const [showChords, setShowChords] = useState(true);
  const [showDue, setShowDue] = useState(false);
  const didInitialFit = useRef(false);

  /* ------------------------------------------------------------- layout */

  const layout = useMemo(() => {
    const placed = new Map<string, Placed>();
    if (!graph) return placed;

    const leafCount = new Map<string, number>();
    const countLeaves = (id: string): number => {
      const n = graph.byId.get(id);
      if (!n) return 0;
      if (leafCount.has(id)) return leafCount.get(id)!;
      const kids = n.kids;
      const v = kids.length
        ? kids.reduce((s, k) => s + countLeaves(k), 0)
        : 1;
      leafCount.set(id, v);
      return v;
    };

    const roots = graph.roots;
    const total =
      roots.reduce((s, r) => s + countLeaves(r.id), 0) +
      GAP_LEAVES * roots.length;

    const place = (id: string, start: number) => {
      const n = graph.byId.get(id)!;
      const span = leafCount.get(id) ?? 1;
      const a0 = (start / total) * Math.PI * 2;
      const a1 = ((start + span) / total) * Math.PI * 2;
      let angle: number;
      if (!n.kids.length) {
        angle = ((start + span / 2) / total) * Math.PI * 2;
      } else {
        let cursor = start;
        const childAngles: number[] = [];
        for (const k of n.kids) {
          place(k, cursor);
          childAngles.push(placed.get(k)!.angle);
          cursor += leafCount.get(k) ?? 1;
        }
        angle =
          (Math.min(...childAngles) + Math.max(...childAngles)) / 2;
      }
      const radius = ringRadius(n.depth);
      placed.set(id, {
        node: n,
        angle,
        radius,
        x: Math.sin(angle) * radius,
        y: -Math.cos(angle) * radius,
        a0,
        a1,
      });
    };

    let cursor = GAP_LEAVES / 2;
    for (const r of roots) {
      place(r.id, cursor);
      cursor += (leafCount.get(r.id) ?? 1) + GAP_LEAVES;
    }
    return placed;
  }, [graph]);

  /**
   * Banded sectors. Ring 0 is a top-level domain; ring 1 is a domain nested
   * inside another one (Computer Vision lives under Deep Learning), drawn as a
   * concentric inner band so both names stay readable.
   */
  const sectors = useMemo(() => {
    const list: { root: LabNode; ring: number }[] = [];
    if (!graph) return list;
    for (const d of graph.domains)
      for (const r of d.roots) {
        const top = !r.primaryParent;
        if (!top && r.subtreeSize < 6) continue;
        list.push({ root: r, ring: top ? 0 : 1 });
      }
    return list.sort((a, b) => a.ring - b.ring);
  }, [graph]);

  const maxRadius = useMemo(() => {
    let m = 0;
    for (const p of layout.values()) m = Math.max(m, p.radius);
    return m || 900;
  }, [layout]);

  // Deferred by a tick so the fit survives React's double-invoked mount
  // effects in development (the second pass would otherwise cancel it).
  useEffect(() => {
    if (!graph || didInitialFit.current || !size.w) return;
    const t = setTimeout(() => {
      didInitialFit.current = true;
      const r = maxRadius + 130;
      fit({ x: -r, y: -r, w: r * 2, h: r * 2 }, 24, 900, 1.6);
    }, 80);
    return () => clearTimeout(t);
  }, [graph, size.w, maxRadius, fit]);

  /* ---------------------------------------------------------- highlight */

  const matches = useMemo(() => matchSet(graph, search), [graph, search]);

  const path = useMemo(() => {
    const id = hovered ?? selected;
    if (!graph || !id) return null;
    return new Set(ancestryOf(graph, id).map((n) => n.id));
  }, [graph, hovered, selected]);

  const branch = useMemo(() => {
    if (!graph || !selected) return null;
    return subtreeIds(graph, selected);
  }, [graph, selected]);

  const alphaOf = useCallback(
    (n: LabNode) => {
      let a = n.depth > maxDepth ? 0.07 : 1;
      if (matches) a *= matches.has(n.id) ? 1 : 0.12;
      if (path) a *= path.has(n.id) || branch?.has(n.id) ? 1 : 0.22;
      return a;
    },
    [matches, path, branch, maxDepth]
  );

  const flyTo = useCallback(
    (id: string, zoomIn = true) => {
      const p = layout.get(id);
      setSelected(id);
      if (p) focusOn(p.x, p.y, zoomIn ? clamp(1.6, 0.6, 3) : undefined, 700);
    },
    [layout, focusOn]
  );

  const resetView = useCallback(() => {
    setSelected(null);
    setSearch("");
    const r = maxRadius + 130;
    fit({ x: -r, y: -r, w: r * 2, h: r * 2 }, 24, 700, 1.6);
  }, [fit, maxRadius]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedNode = selected ? graph?.byId.get(selected) ?? null : null;
  const trail = graph && selectedNode ? ancestryOf(graph, selectedNode.id) : [];

  if (error) return <MapError message={error} />;
  if (!graph) return <MapLoading text="Aligning the rings…" />;

  const k = transform.k;
  /** World-space stroke/size compensation so lines stay optically constant. */
  const px = (v: number) => v / Math.max(k, 0.0001);

  const nodes = [...layout.values()];
  const chords = showChords
    ? graph.nodes.flatMap((n) =>
        n.extraParents
          .map((p) => ({ from: layout.get(p), to: layout.get(n.id), n }))
          .filter((c) => c.from && c.to)
      )
    : [];

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: SAND.bg, fontFamily: SANS }}
    >
      <div
        ref={hostRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          background:
            "radial-gradient(65% 65% at 50% 50%, #f7f7f4 0%, #F3F3F0 55%, #e9e9e2 100%)",
        }}
      >
        <svg width="100%" height="100%" className="block">
          <defs>
            <radialGradient id="core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(${transform.x},${transform.y}) scale(${k})`}>
            {/* ---------------------------------------------- ring guides */}
            {RINGS.filter((r) => r > 0 && r <= maxRadius + 10).map((r, i) => (
              <circle
                key={r}
                r={r}
                fill="none"
                stroke={rgba("#8a8577", 0.16)}
                strokeWidth={px(1)}
                strokeDasharray={i === 0 ? undefined : `${px(3)} ${px(7)}`}
              />
            ))}

            {/* -------------------------------------------- domain sectors */}
            {sectors.map(({ root, ring }) => {
              const p = layout.get(root.id);
              if (!p) return null;
              const color = pigment(root.domain);
              const rOut = maxRadius + 120 - ring * 52;
              const mid = (p.a0 + p.a1) / 2;
              const lit = !path || path.has(root.id);
              return (
                <g key={`sector-${root.id}`} opacity={lit ? 1 : 0.45}>
                  {ring === 0 && (
                    <path
                      d={annulus(0, rOut, p.a0, p.a1)}
                      fill={rgba(color, 0.05)}
                    />
                  )}
                  <path
                    d={annulus(rOut - 46, rOut, p.a0 + 0.01, p.a1 - 0.01)}
                    fill={rgba(color, 0.14)}
                  />
                  <path
                    id={`arc-${root.id}`}
                    d={arcPath(
                      rOut - (isBottom(mid) ? 30 : 17),
                      p.a0 + 0.02,
                      p.a1 - 0.02,
                      // Bottom-half sectors get a reversed arc so the label
                      // reads left-to-right instead of upside down.
                      isBottom(mid)
                    )}
                    fill="none"
                  />
                  <text
                    fill={rgba(darken(color, 0.25), 0.85)}
                    style={{
                      fontFamily: SERIF,
                      fontSize: 26,
                      letterSpacing: 6,
                      fontStyle: "italic",
                    }}
                  >
                    <textPath
                      href={`#arc-${root.id}`}
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      {domainLabel(root.domain).toUpperCase()}
                      {"   ·   "}
                      {graph.domains.find((d) => d.domain === root.domain)
                        ?.nodes.length ?? 0}
                    </textPath>
                  </text>
                </g>
              );
            })}

            {/* --------------------------------------------- second parents */}
            <g>
              {chords.map((c, i) => {
                const a = alphaOf(c.n);
                const lit = path?.has(c.n.id) || path?.has(c.from!.node.id);
                if (a < 0.1 && !lit) return null;
                return (
                  <path
                    key={`chord-${i}`}
                    d={chordPath(c.from!, c.to!)}
                    fill="none"
                    stroke={rgba(
                      pigment(c.from!.node.domain),
                      lit ? 0.55 : 0.14 * a
                    )}
                    strokeWidth={px(lit ? 1.6 : 0.9)}
                    strokeDasharray={`${px(4)} ${px(5)}`}
                  />
                );
              })}
            </g>

            {/* ------------------------------------------------ tree links */}
            <g>
              {nodes.map((p) => {
                const parent = p.node.primaryParent
                  ? layout.get(p.node.primaryParent)
                  : null;
                if (!parent) return null;
                const lit = path?.has(p.node.id) && path?.has(parent.node.id);
                const a = Math.min(alphaOf(p.node), alphaOf(parent.node));
                return (
                  <path
                    key={`link-${p.node.id}`}
                    d={radialLink(parent, p)}
                    fill="none"
                    stroke={rgba(
                      pigment(p.node.domain),
                      lit ? 0.9 : 0.3 * a
                    )}
                    strokeWidth={px(
                      lit ? 2.4 : clamp(0.7 + Math.log10(p.node.subtreeSize) * 1.1, 0.7, 3)
                    )}
                    strokeLinecap="round"
                    style={{ transition: "stroke 160ms linear" }}
                  />
                );
              })}
            </g>

            {/* ----------------------------------------------------- centre */}
            <g>
              <circle r={92} fill="url(#core)" />
              <circle
                r={46}
                fill={SAND.bg140}
                stroke={rgba("#8a8577", 0.5)}
                strokeWidth={px(1)}
              />
              <text
                textAnchor="middle"
                y={-4}
                fill={SAND.textStrong}
                style={{ fontFamily: SERIF, fontSize: 15 }}
              >
                {graph.totals.nodes}
              </text>
              <text
                textAnchor="middle"
                y={13}
                fill={SAND.muted}
                style={{ fontSize: 9, letterSpacing: 1.4 }}
              >
                CONCEPTS
              </text>
            </g>

            {/* ------------------------------------------------------ nodes */}
            <g>
              {nodes.map((p) => {
                const n = p.node;
                const a = alphaOf(n);
                if (a < 0.05) return null;
                const color = pigment(n.domain);
                const r = clamp(
                  3.4 + Math.log10(n.cards + 1) * 5.2 + (n.kids.length ? 1.6 : 0),
                  3.2,
                  17
                );
                const isSel = selected === n.id;
                const isHot = hovered === n.id;
                // Label budget scales with zoom: at overview only the spine of
                // the tree is named, details arrive as you move in.
                const showLabel =
                  isSel ||
                  isHot ||
                  (a > 0.6 &&
                    (n.depth <= 1 ||
                      k > 1.1 ||
                      (k > 0.75 && (n.cards >= 4 || n.kids.length > 0)) ||
                      (n.depth <= 2 && n.kids.length > 0) ||
                      n.cards >= 20));
                const deg = (p.angle * 180) / Math.PI;
                const flip = p.angle > Math.PI;

                return (
                  <g
                    key={n.id}
                    opacity={a}
                    style={{ transition: "opacity 200ms linear" }}
                    onPointerEnter={() => setHovered(n.id)}
                    onPointerLeave={() => setHovered((h) => (h === n.id ? null : h))}
                    onClick={() => {
                      if (wasDragged()) return;
                      flyTo(n.id);
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r + 9}
                      fill="transparent"
                      pointerEvents="all"
                    />
                    {(isSel || isHot) && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r + px(7)}
                        fill="none"
                        stroke={rgba(color, 0.5)}
                        strokeWidth={px(1.4)}
                      />
                    )}
                    {/* review-pressure arc — opt-in, since almost everything
                        is due it would otherwise ring every single node */}
                    {showDue && n.cards > 0 && pressure(n) > 0.05 && (
                      <path
                        d={gaugePath(p.x, p.y, r + 3.2, pressure(n))}
                        fill="none"
                        stroke={rgba("#c2603a", 0.8)}
                        strokeWidth={px(1.9)}
                        strokeLinecap="round"
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r}
                      fill={
                        n.kids.length
                          ? lighten(color, 0.12)
                          : rgba(color, 0.9)
                      }
                      stroke={darken(color, 0.45)}
                      strokeWidth={px(n.depth <= 1 ? 1.6 : 1)}
                    />
                    {showLabel && (
                      <g
                        transform={`translate(${p.x},${p.y}) rotate(${
                          flip ? deg + 90 : deg - 90
                        })`}
                      >
                        <text
                          x={flip ? -(r + 7) : r + 7}
                          y={0}
                          textAnchor={flip ? "end" : "start"}
                          dominantBaseline="middle"
                          fill={n.depth <= 1 ? darken(color, 0.5) : "#3f3a30"}
                          style={{
                            fontFamily: n.depth <= 1 ? SERIF : SANS,
                            fontSize: clamp(
                              9 + Math.log10(n.cards + 1) * 3.4,
                              9,
                              20
                            ),
                            fontWeight: n.depth <= 1 ? 600 : 500,
                            paintOrder: "stroke",
                            stroke: rgba("#F3F3F0", 0.85),
                            strokeWidth: 3.5,
                          }}
                        >
                          {n.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      {/* ---------------------------------------------------------- chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4">
        <div className="pointer-events-auto rounded-2xl border border-sand-300 bg-sand-140/85 px-4 py-3 backdrop-blur-md">
          <Link
            href="/"
            className="text-[11px] text-sand-600 transition-colors hover:text-sand-900"
          >
            ← Oleg Tolochko
          </Link>
          <h1 className="mt-1 text-[21px] font-bold leading-none text-sand-900">
            Knowledge<span className="text-blue-500">.</span>
          </h1>
          <p className="mt-1.5 text-[11px] text-sand-700">
            rings = specificity · sectors = domains
          </p>
          <p className="mt-0.5 text-[11px] tabular-nums text-sand-600">
            {graph.totals.cards} cards · {graph.totals.due} due
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-sand-300 bg-sand-140/85 p-1.5 pl-2 backdrop-blur-md">
          <SearchField
            graph={graph}
            value={search}
            onChange={setSearch}
            onPick={(n) => flyTo(n.id)}
            width="w-56"
          />
          <span className="h-5 w-px bg-sand-300" />
          <button
            onClick={() => setShowChords((v) => !v)}
            className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
              showChords
                ? "bg-sand-900/90 text-sand-100"
                : "text-sand-800 hover:bg-sand-200"
            }`}
            title="Second parents from the underlying DAG"
          >
            Cross-links
          </button>
          <button
            onClick={() => setShowDue((v) => !v)}
            className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
              showDue
                ? "bg-sand-900/90 text-sand-100"
                : "text-sand-800 hover:bg-sand-200"
            }`}
            title="Ring each concept by how overdue its cards are"
          >
            Due
          </button>
          <span className="h-5 w-px bg-sand-300" />
          <button
            onClick={() => zoomBy(1 / 1.5)}
            className="h-7 w-7 rounded-full text-sand-800 transition-colors hover:bg-sand-200"
          >
            −
          </button>
          <button
            onClick={() => zoomBy(1.5)}
            className="h-7 w-7 rounded-full text-sand-800 transition-colors hover:bg-sand-200"
          >
            +
          </button>
          <button
            onClick={resetView}
            className="h-7 w-7 rounded-full text-sand-800 transition-colors hover:bg-sand-200"
            title="Fit"
          >
            ⤢
          </button>
        </div>

      </div>

      {/* depth control */}
      <div className="absolute bottom-4 left-4 z-20 w-[248px] rounded-2xl border border-sand-300 bg-sand-140/80 p-3.5 backdrop-blur-md">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sand-700">
            Detail
          </span>
          <span className="text-[11px] tabular-nums text-sand-800">
            {maxDepth >= 9 ? "everything" : `${maxDepth + 1} rings`}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={9}
          value={maxDepth}
          onChange={(e) => setMaxDepth(Number(e.target.value))}
          className="mt-2 w-full accent-sand-800"
        />
        <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-sand-300 pt-2.5 text-[10.5px] text-sand-700">
          {graph.domains.map((d) => (
            <button
              key={d.domain}
              onClick={() => {
                const root = graph.roots.find((r) => r.domain === d.domain);
                if (root) flyTo(root.id);
              }}
              className="flex items-center gap-1.5 text-left transition-colors hover:text-sand-900"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: pigment(d.domain) }}
              />
              <span className="truncate">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* breadcrumb */}
      {trail.length > 0 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-sand-300 bg-sand-140/90 px-3 py-1.5 backdrop-blur-md">
          {trail.map((t, i) => (
            <span key={t.id} className="flex items-center gap-1">
              {i > 0 && <span className="text-sand-500">›</span>}
              <button
                onClick={() => flyTo(t.id)}
                className={`text-[12px] transition-colors hover:text-sand-900 ${
                  i === trail.length - 1
                    ? "font-semibold text-sand-900"
                    : "text-sand-700"
                }`}
              >
                {t.label}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* detail panel */}
      <div
        className={`absolute right-0 top-0 z-30 h-full w-[350px] max-w-[86vw] transform border-l border-sand-300 bg-sand-140/95 shadow-[-8px_0_40px_rgba(120,115,95,0.12)] backdrop-blur-lg transition-transform duration-300 ease-out ${
          selectedNode ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedNode && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-sand-300 px-5 py-3">
              <span className="text-[11px] uppercase tracking-[0.16em] text-sand-600">
                Ring {selectedNode.depth}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full px-2 py-0.5 text-sand-600 transition-colors hover:bg-sand-200 hover:text-sand-900"
              >
                ✕
              </button>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-4">
              <NodeDetail
                node={selectedNode}
                graph={graph}
                onNavigate={(id) => flyTo(id)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- geometry */

const pt = (angle: number, r: number): [number, number] => [
  Math.sin(angle) * r,
  -Math.cos(angle) * r,
];

/** Elbow link in polar space: arc along the parent ring, then out radially. */
function radialLink(from: Placed, to: Placed) {
  const midR = (from.radius + to.radius) / 2;
  const [x0, y0] = pt(from.angle, from.radius);
  const [x1, y1] = pt(to.angle, to.radius);
  const [c0x, c0y] = pt(from.angle, midR);
  const [c1x, c1y] = pt(to.angle, midR);
  return `M${x0},${y0} C${c0x},${c0y} ${c1x},${c1y} ${x1},${y1}`;
}

/** Chord bundled toward the centre — used for the DAG's extra parents. */
function chordPath(from: Placed, to: Placed) {
  const [x0, y0] = pt(from.angle, from.radius);
  const [x1, y1] = pt(to.angle, to.radius);
  const pull = 0.32;
  return `M${x0},${y0} Q${(x0 + x1) * pull},${(y0 + y1) * pull} ${x1},${y1}`;
}

function arcPath(r: number, a0: number, a1: number, reverse = false) {
  const [x0, y0] = pt(a0, r);
  const [x1, y1] = pt(a1, r);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return reverse
    ? `M${x1},${y1} A${r},${r} 0 ${large} 0 ${x0},${y0}`
    : `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`;
}

/** True for sector mid-angles that would render text upside down. */
const isBottom = (mid: number) => {
  const a = ((mid % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return a > Math.PI * 0.55 && a < Math.PI * 1.45;
};

function annulus(r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = pt(a0, r1);
  const [x1, y1] = pt(a1, r1);
  const [x2, y2] = pt(a1, r0);
  const [x3, y3] = pt(a0, r0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  if (r0 === 0)
    return `M0,0 L${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} Z`;
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
}

/** Small gauge arc around a node, 0→1 of a full turn, starting at 12 o'clock. */
function gaugePath(cx: number, cy: number, r: number, t: number) {
  const a = clamp(t, 0, 0.999) * Math.PI * 2;
  const x0 = cx;
  const y0 = cy - r;
  const x1 = cx + Math.sin(a) * r;
  const y1 = cy - Math.cos(a) * r;
  const large = a > Math.PI ? 1 : 0;
  return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`;
}
