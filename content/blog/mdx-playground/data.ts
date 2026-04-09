import type { TokenHeatmapVariant, TokenTableProps } from "@/components/mdx/token-types";

export const playgroundTableColumns: TokenTableProps["columns"] = [
  "Feature",
  "How you write it",
  "When to use it",
];

export const playgroundTableRows: TokenTableProps["rows"] = [
  ["Plain prose", "Regular markdown paragraphs", "Default for almost all writing."],
  ["Structured note", "<Callout /> or <Aside />", "When a section should stand out without becoming a new heading."],
  ["Dense data", "<TokenTable /> or markdown tables", "When rows and columns communicate better than prose."],
  ["Custom visual", "<Figure /> + component", "When you need an illustration or interactive block."],
];

export const playgroundHeatmapText =
  "This sample block shows how article-specific datasets can stay outside the prose file.";

export const playgroundHeatmapVariants: TokenHeatmapVariant[] = [
  {
    label: "Readable split",
    description: "A simple example with mostly clean token boundaries.",
    tokens: [
      { text: "This", score: 0.12 },
      { text: " sample", score: 0.16 },
      { text: " block", score: 0.18 },
      { text: " shows", score: 0.14 },
      { text: " how", score: 0.09 },
      { text: " article", score: 0.17 },
      { text: "-specific", score: 0.23 },
      { text: " datasets", score: 0.18 },
      { text: " can", score: 0.1 },
      { text: " stay", score: 0.13 },
      { text: " outside", score: 0.16 },
      { text: " the", score: 0.06 },
      { text: " prose", score: 0.2 },
      { text: " file", score: 0.15 },
      { text: ".", score: 0.05 },
    ],
  },
  {
    label: "Noisier split",
    description: "The same sentence, but broken into less useful pieces.",
    tokens: [
      { text: "This", score: 0.12 },
      { text: " sam", score: 0.38 },
      { text: "ple", score: 0.21 },
      { text: " block", score: 0.18 },
      { text: " shows", score: 0.14 },
      { text: " how", score: 0.09 },
      { text: " arti", score: 0.34 },
      { text: "cle", score: 0.19 },
      { text: "-specific", score: 0.23 },
      { text: " data", score: 0.29 },
      { text: "sets", score: 0.18 },
      { text: " can", score: 0.1 },
      { text: " stay", score: 0.13 },
      { text: " outside", score: 0.16 },
      { text: " the", score: 0.06 },
      { text: " prose", score: 0.2 },
      { text: " file", score: 0.15 },
      { text: ".", score: 0.05 },
    ],
  },
];
