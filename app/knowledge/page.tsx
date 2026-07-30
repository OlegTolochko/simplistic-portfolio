import type { Metadata } from "next";
import KnowledgeMap from "./knowledge-map";

export const metadata: Metadata = {
  title: "Knowledge — Oleg Tolochko",
  description:
    "A map of what I have studied: concepts, how they relate, and how well I still know them.",
};

export default function KnowledgePage() {
  return <KnowledgeMap />;
}
