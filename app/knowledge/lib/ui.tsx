"use client";

/**
 * Building blocks for the knowledge map: the search field, the concept detail
 * panel and the loading / error states.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { SANS, SAND, pigment, rgba } from "./theme";
import {
  domainLabel,
  pressure,
  searchNodes,
  type LabGraph,
  type LabNode,
} from "./use-knowledge";

/* ----------------------------------------------------------------- search */

/**
 * Search box with a ranked result list, arrow-key navigation and Enter to
 * select. `/` focuses it from anywhere, Escape clears.
 */
export function SearchField({
  graph,
  value,
  onChange,
  onPick,
  placeholder = "Search concepts…",
  width = "w-64",
  align = "left",
}: {
  graph: LabGraph | null;
  value: string;
  onChange: (v: string) => void;
  onPick: (node: LabNode) => void;
  placeholder?: string;
  width?: string;
  align?: "left" | "right";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const hits = useMemo(() => searchNodes(graph, value), [graph, value]);

  useEffect(() => setCursor(0), [value]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`relative ${width}`} style={{ fontFamily: SANS }}>
      <svg
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sand-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
            inputRef.current?.blur();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor((c) => Math.min(hits.length - 1, c + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(0, c - 1));
          } else if (e.key === "Enter" && hits[cursor]) {
            e.preventDefault();
            onPick(hits[cursor].node);
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-full border border-sand-300 bg-sand-140/80 py-1.5 pl-8 pr-8 text-[13px] text-sand-900 placeholder:text-sand-700/80 outline-none transition-colors focus:border-sand-600 focus:bg-sand-140"
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-sand-700 hover:text-sand-900"
          aria-label="Clear search"
        >
          ✕
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-sand-400 px-1 text-[10px] text-sand-700">
          /
        </kbd>
      )}

      {open && hits.length > 0 && (
        <ul
          className={`absolute top-[calc(100%+6px)] z-50 max-h-72 w-72 overflow-y-auto rounded-xl border border-sand-300 bg-sand-140/95 p-1 shadow-lg backdrop-blur-md ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {hits.map((h, i) => (
            <li key={h.node.id}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPick(h.node);
                  setOpen(false);
                }}
                onMouseEnter={() => setCursor(i)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                  i === cursor ? "bg-sand-200" : "hover:bg-sand-200/60"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: pigment(h.node.domain) }}
                />
                <span className="flex-1 truncate text-[13px] text-sand-900">
                  {h.node.label}
                </span>
                <span className="shrink-0 text-[10px] tabular-nums text-sand-700">
                  {h.node.cards}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- primitives */

export function DomainDot({ domain, size = 8 }: { domain: string; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: pigment(domain) }}
    />
  );
}

export function Meter({
  value,
  color,
  height = 4,
}: {
  value: number;
  color: string;
  height?: number;
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ height, background: rgba(color, 0.16) }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.round(Math.min(1, value) * 100)}%`, background: color }}
      />
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-sand-300/70 py-1.5 last:border-0">
      <span className="text-[11px] uppercase tracking-wide text-sand-700">
        {label}
      </span>
      <span className="text-[13px] tabular-nums text-sand-900">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------ node detail */

/**
 * Body of the per-node detail view. Each version wraps it in its own
 * container (drawer, card, sheet) but the content stays consistent.
 */
export function NodeDetail({
  node,
  graph,
  onNavigate,
}: {
  node: LabNode;
  graph: LabGraph;
  onNavigate?: (id: string) => void;
}) {
  const color = pigment(node.domain);
  const decks = (node.anki?.deck ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const parents = node.parents
    .map((p) => graph.byId.get(p))
    .filter(Boolean) as LabNode[];
  const kids = node.kids
    .map((k) => graph.byId.get(k))
    .filter(Boolean) as LabNode[];
  const related = [...(graph.neighbors.get(node.id) ?? [])]
    .filter((id) => !node.parents.includes(id) && !node.kids.includes(id))
    .map((id) => graph.byId.get(id))
    .filter(Boolean) as LabNode[];
  const p = pressure(node);

  return (
    <div style={{ fontFamily: SANS }} className="text-sand-900">
      <div className="flex items-center gap-2">
        <DomainDot domain={node.domain} size={9} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sand-700">
          {domainLabel(node.domain)}
        </span>
      </div>

      <h2 className="mt-1.5 text-[19px] font-semibold leading-snug text-sand-900">
        {node.label}
      </h2>

      {node.description && (
        <p className="mt-2 text-[13px] leading-relaxed text-sand-800">
          {node.description}
        </p>
      )}

      {node.cards > 0 && (
        <div className="mt-4 rounded-xl border border-sand-300 bg-sand-160/60 p-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[22px] font-semibold leading-none tabular-nums">
                {node.due}
                <span className="text-[13px] font-normal text-sand-700">
                  {" "}
                  / {node.cards}
                </span>
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-sand-700">
                cards due
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] tabular-nums text-sand-800">
                {Math.round(p * 100)}%
              </div>
              <div className="text-[11px] uppercase tracking-wide text-sand-700">
                pressure
              </div>
            </div>
          </div>
          <div className="mt-2.5">
            <Meter value={p} color={color} />
          </div>
        </div>
      )}

      <div className="mt-3">
        <Stat
          label="Last reviewed"
          value={`${node.lastReviewed} · ${node.days}d ago`}
        />
        <Stat label="Avg ease" value={node.ease ? node.ease.toFixed(2) : "—"} />
        <Stat
          label="Position"
          value={`depth ${node.depth} · ${node.subtreeSize - 1} sub-topics`}
        />
      </div>

      {decks.length > 0 && (
        <Section title={decks.length === 1 ? "Deck" : "Decks"}>
          <div className="flex flex-wrap gap-1.5">
            {decks.map((d) => (
              <span
                key={d}
                className="rounded-md border border-sand-300 bg-sand-200/70 px-2 py-0.5 text-[11px] text-sand-800"
              >
                {d}
              </span>
            ))}
          </div>
        </Section>
      )}

      {parents.length > 0 && (
        <Section title="Part of">
          <NodeChips nodes={parents} onNavigate={onNavigate} />
        </Section>
      )}
      {kids.length > 0 && (
        <Section title={`Contains (${kids.length})`}>
          <NodeChips nodes={kids.slice(0, 14)} onNavigate={onNavigate} />
        </Section>
      )}
      {related.length > 0 && (
        <Section title="Related">
          <NodeChips nodes={related.slice(0, 12)} onNavigate={onNavigate} />
        </Section>
      )}

      {node.links && node.links.length > 0 && (
        <Section title="Links">
          <div className="space-y-1">
            {node.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] text-blue-700 hover:underline"
              >
                <span className="text-sand-600">↗</span>
                <span className="truncate">{l.label || l.url}</span>
              </a>
            ))}
          </div>
        </Section>
      )}

      {node.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {node.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-sand-200/80 px-2 py-0.5 text-[10px] text-sand-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {node.obsidianPath && (
        <p className="mt-3 break-all text-[10px] text-sand-600">
          {node.obsidianPath}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sand-600">
        {title}
      </h3>
      {children}
    </div>
  );
}

function NodeChips({
  nodes,
  onNavigate,
}: {
  nodes: LabNode[];
  onNavigate?: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {nodes.map((n) => (
        <button
          key={n.id}
          onClick={() => onNavigate?.(n.id)}
          className="group flex items-center gap-1.5 rounded-full border border-sand-300 bg-sand-160/70 px-2 py-0.5 text-[11px] text-sand-800 transition-colors hover:border-sand-500 hover:bg-sand-200"
        >
          <DomainDot domain={n.domain} size={6} />
          <span className="max-w-[150px] truncate">{n.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- states */

export function MapLoading({ text = "Loading knowledge…" }: { text?: string }) {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      style={{ background: SAND.bg }}
    >
      <div className="flex items-center gap-3 text-sand-700" style={{ fontFamily: SANS }}>
        <span className="h-3 w-3 animate-ping rounded-full bg-sand-600" />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}

export function MapError({ message }: { message: string }) {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      style={{ background: SAND.bg }}
    >
      <div className="max-w-sm space-y-3 p-8 text-center" style={{ fontFamily: SANS }}>
        <h2 className="text-lg font-semibold text-sand-900">
          Could not load the graph
        </h2>
        <p className="text-sm text-sand-700">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-sand-400 bg-sand-200 px-4 py-2 text-sm text-sand-900 transition-colors hover:bg-sand-300"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
