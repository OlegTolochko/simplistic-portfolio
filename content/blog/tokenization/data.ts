import type { TokenHeatmapVariant, TokenTableProps } from "@/components/mdx/token-types";

export const mergeExampleText =
  "Tokenization quietly decides how much structure the model gets to preserve before it even starts predicting.";

export const tokenTableColumns: TokenTableProps["columns"] = [
  "Input",
  "Possible split",
  "Why it matters",
];

export const mergeExampleRows: TokenTableProps["rows"] = [
  [
    "tokenization",
    "token + ization",
    "Frequent subword pieces help the model reuse statistics across related words.",
  ],
  [
    "GPT-4o",
    "GPT + - + 4 + o",
    "Hyphens, digits, and product names often create splits that matter for prompting and evaluation.",
  ],
  [
    "  indentation",
    "'  ' + indentation",
    "Whitespace can be encoded explicitly, which is why formatting-heavy text behaves differently from plain prose.",
  ],
];

export const tokenizerHeatmapVariants: TokenHeatmapVariant[] = [
  {
    label: "Balanced split",
    description:
      "A healthier split keeps common morphemes intact and avoids over-fragmenting the sentence.",
    tokens: [
      { text: "Token", score: 0.22, note: "Common stem with strong reuse across vocabulary." },
      { text: "ization", score: 0.28, note: "Frequent suffix, usually easy for the model to continue from." },
      { text: " quietly", score: 0.15, note: "High-frequency natural-language token." },
      { text: " decides", score: 0.19, note: "Reasonably stable continuation token." },
      { text: " how", score: 0.12 },
      { text: " much", score: 0.16 },
      { text: " structure", score: 0.24, note: "Domain word but still a familiar chunk." },
      { text: " the", score: 0.08 },
      { text: " model", score: 0.18 },
      { text: " gets", score: 0.14 },
      { text: " to", score: 0.07 },
      { text: " preserve", score: 0.21 },
      { text: " before", score: 0.13 },
      { text: " it", score: 0.08 },
      { text: " even", score: 0.11 },
      { text: " starts", score: 0.17 },
      { text: " predicting", score: 0.26, note: "Longer technical word, but still segmented reasonably." },
      { text: ".", score: 0.09 },
    ],
  },
  {
    label: "Over-fragmented split",
    description:
      "A worse split breaks semantic units apart and pushes more burden onto the model to reassemble meaning.",
    tokens: [
      { text: "Tok", score: 0.58, note: "Rare fragment with weaker standalone statistics." },
      { text: "en", score: 0.33 },
      { text: "ization", score: 0.28 },
      { text: " quietly", score: 0.15 },
      { text: " dec", score: 0.49, note: "Awkward partial token." },
      { text: "ides", score: 0.36 },
      { text: " how", score: 0.12 },
      { text: " much", score: 0.16 },
      { text: " struct", score: 0.55, note: "The model must infer the intended word from a broken chunk." },
      { text: "ure", score: 0.38 },
      { text: " the", score: 0.08 },
      { text: " model", score: 0.18 },
      { text: " gets", score: 0.14 },
      { text: " to", score: 0.07 },
      { text: " pre", score: 0.47 },
      { text: "serve", score: 0.29 },
      { text: " before", score: 0.13 },
      { text: " it", score: 0.08 },
      { text: " even", score: 0.11 },
      { text: " starts", score: 0.17 },
      { text: " predict", score: 0.43 },
      { text: "ing", score: 0.24 },
      { text: ".", score: 0.09 },
    ],
  },
];
