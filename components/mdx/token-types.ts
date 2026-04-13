import type { ReactNode } from "react";

export type CalloutProps = {
  title?: string;
  tone?: "info" | "warning" | "success";
  children: ReactNode;
};

export type FigureProps = {
  caption?: string;
  children: ReactNode;
};

export type MetricProps = {
  label: string;
  value: string;
  detail?: string;
};

export type TokenTableProps = {
  columns: string[];
  rows: ReactNode[][];
  caption?: string;
};

export type TokenHeatmapToken = {
  text: string;
  score: number;
  note?: string;
};

export type TokenHeatmapVariant = {
  label: string;
  description?: string;
  tokens: TokenHeatmapToken[];
};

export type TokenHeatmapProps = {
  text: string;
  variants: TokenHeatmapVariant[];
};
