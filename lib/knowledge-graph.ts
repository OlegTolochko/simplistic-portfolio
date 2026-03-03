import graphData from "@/app/data/knowledge_graph.json";

export type KnowledgeDomain =
  | "ml-systems"
  | "deep-learning"
  | "nlp"
  | "computer-vision"
  | "statistics"
  | "backend"
  | "frontend"
  | "infrastructure"
  | "math";

export type KnowledgeGraphNode = {
  id: string;
  label: string;
  domain: KnowledgeDomain;
  lastReviewed: string;
  tags: string[];
  obsidianPath?: string;
  description?: string;
  links?: { url: string; label?: string }[];
  anki?: {
    deck?: string;
    totalCards: number;
    dueCards: number;
    avgEase?: number;
  };
};

export type KnowledgeGraphLink = {
  source: string;
  target: string;
  kind: "depends-on" | "part-of" | "applies-to" | "related";
  weight?: number;
};

export type KnowledgeGraphData = {
  meta: {
    source: string;
    updatedAt: string;
  };
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
};

export const knowledgeGraphData = graphData as KnowledgeGraphData;

export const domainLabel = (domain: string) => {
  const map: Record<string, string> = {
    "deep-learning": "Deep Learning",
    nlp: "NLP",
    "computer-vision": "Computer Vision",
    statistics: "Statistics",
    "ml-systems": "ML Systems",
    backend: "Backend",
    frontend: "Frontend",
    infrastructure: "Infrastructure",
    math: "Math",
  };
  return map[domain] ?? domain;
};

export const domainColor = (domain: KnowledgeDomain) => {
  switch (domain) {
    case "deep-learning":
      return "#8b5cf6";
    case "nlp":
      return "#0ea5e9";
    case "computer-vision":
      return "#22c55e";
    case "statistics":
      return "#14b8a6";
    case "ml-systems":
      return "#2563eb";
    case "backend":
      return "#059669";
    case "frontend":
      return "#ea580c";
    case "infrastructure":
      return "#4f46e5";
    case "math":
      return "#db2777";
    default:
      return "#64748b";
  }
};

/**
 * Returns a domain color adjusted for ease factor.
 * Higher ease → more saturated/vibrant; lower ease → more desaturated/muted.
 * Ease typically ranges from ~1.3 (hard) to ~3.0+ (easy), default 2.5.
 */
export const domainColorWithEase = (
  domain: KnowledgeDomain,
  avgEase?: number
) => {
  const base = domainColor(domain);
  if (typeof avgEase !== "number") return base;

  // Map ease to a saturation multiplier: 1.3→0.45, 2.5→1.0, 3.2+→1.15
  const t = Math.max(0, Math.min(1, (avgEase - 1.3) / (3.2 - 1.3)));
  const satMul = 0.45 + t * 0.7;

  // Parse hex to HSL, adjust saturation, return hex
  const r = parseInt(base.slice(1, 3), 16) / 255;
  const g = parseInt(base.slice(3, 5), 16) / 255;
  const b = parseInt(base.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0,
    s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  const newS = Math.min(1, s * satMul);

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q2 = l < 0.5 ? l * (1 + newS) : l + newS - l * newS;
  const p2 = 2 * l - q2;
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(hue2rgb(p2, q2, h + 1 / 3))}${toHex(hue2rgb(p2, q2, h))}${toHex(hue2rgb(p2, q2, h - 1 / 3))}`;
};

export const daysSinceReview = (date: string) => {
  const reviewedAt = new Date(date).getTime();
  const now = Date.now();
  return Math.floor(Math.max(0, now - reviewedAt) / (1000 * 60 * 60 * 24));
};

export const nodeUrgencyScore = (node: KnowledgeGraphNode) => {
  const dueCards = node.anki?.dueCards ?? 0;
  const totalCards = node.anki?.totalCards ?? 0;
  const avgEase = node.anki?.avgEase;
  const days = daysSinceReview(node.lastReviewed);

  const dueRatio = totalCards > 0 ? dueCards / totalCards : 0;
  const easePenalty = typeof avgEase === "number" ? Math.max(0, 2.5 - avgEase) : 0;

  return dueCards * 2 + dueRatio * 4 + Math.min(4, days / 14) + easePenalty * 2;
};
