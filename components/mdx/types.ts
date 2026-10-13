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
