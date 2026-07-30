/**
 * Visual language for the knowledge map.
 *
 * Everything here is derived from the portfolio's sand palette so the map
 * reads as part of the same site.
 */

import type { KnowledgeDomain } from "@/lib/knowledge-graph";

export const SAND = {
  bg: "#F3F3F0",
  bg140: "#efefeb",
  bg160: "#edede8",
  panel: "#e8e8e3",
  line: "#deded5",
  line400: "#d3d3c8",
  line500: "#c8c8ba",
  muted: "#8f8f7c",
  text: "#3a3a32",
  textStrong: "#22221c",
} as const;

/** Domain pigments, tuned to sit on the sand background without vibrating. */
export const PIGMENT: Record<KnowledgeDomain, string> = {
  "deep-learning": "#7a5aa8",
  nlp: "#3a7bb1",
  "computer-vision": "#4a8f51",
  "3d-vision": "#9a6b2f",
  statistics: "#2a8a84",
  "ml-systems": "#3c62a0",
  backend: "#7a7565",
  frontend: "#b45a2a",
  infrastructure: "#4b4b90",
  math: "#a63b7a",
};

export const pigment = (d: string) =>
  PIGMENT[d as KnowledgeDomain] ?? "#7a7565";

export const SERIF = 'Georgia, "Iowan Old Style", "Palatino", serif';
export const SANS = 'Inter, system-ui, -apple-system, sans-serif';
export const MONO = '"JetBrains Mono", "SF Mono", ui-monospace, monospace';

/* ---------------------------------------------------------------- colors */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function rgba(hex: string, a = 1) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** Linear blend between two hex colors. t=0 → a, t=1 → b. */
export function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const to = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r1, r2)}${to(g1, g2)}${to(b1, b2)}`;
}

export const darken = (hex: string, t = 0.25) => mix(hex, "#1c1a16", t);
export const lighten = (hex: string, t = 0.25) => mix(hex, "#ffffff", t);

/* ------------------------------------------------------------------ misc */

export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** Smooth 0→1 ramp used for zoom-driven fades. */
export const ramp = (v: number, from: number, to: number) => {
  const t = clamp((v - from) / (to - from || 1), 0, 1);
  return t * t * (3 - 2 * t);
};
