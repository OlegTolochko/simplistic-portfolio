"use client";

import { useState } from "react";

import type { TokenHeatmapProps } from "./token-types";

function getTokenBackground(score: number) {
  const normalized = Math.min(1, Math.max(0, score));
  const alpha = 0.08 + normalized * 0.42;
  return `rgba(184, 94, 58, ${alpha})`;
}

function getTokenBorder(score: number) {
  const normalized = Math.min(1, Math.max(0, score));
  const alpha = 0.14 + normalized * 0.32;
  return `rgba(124, 58, 29, ${alpha})`;
}

export default function TokenHeatmap({ text, variants }: TokenHeatmapProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);

  const activeVariant = variants[selectedIndex];
  const activeToken = activeTokenIndex != null ? activeVariant.tokens[activeTokenIndex] : null;

  return (
    <figure className="my-10 overflow-hidden rounded-[1.75rem] border border-sand-300 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-sand-200 bg-sand-50 px-5 py-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-sand-950">Loss Heatmap</h3>
          <p className="max-w-2xl text-sm leading-6 text-sand-600">
            {activeVariant.description ?? text}
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-sand-700">
          <span>Variant</span>
          <select
            value={selectedIndex}
            onChange={(event) => {
              setSelectedIndex(Number(event.target.value));
              setActiveTokenIndex(null);
            }}
            className="rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm text-sand-900"
          >
            {variants.map((variant, index) => (
              <option key={variant.label} value={index}>
                {variant.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-sand-500">
          <div className="flex items-center gap-3">
            <span>Low loss</span>
            <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[#f7ebe4] to-[#b85e3a]" />
            <span>High loss</span>
          </div>
          <span>Tap a token for details.</span>
        </div>

        <div className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-4 leading-8 text-sand-900">
          {activeVariant.tokens.map((token, index) => (
            <button
              key={`${token.text}-${index}`}
              type="button"
              onClick={() => setActiveTokenIndex(index)}
              className={`mb-1 inline rounded px-0.5 text-left transition-transform hover:-translate-y-0.5 ${
                activeTokenIndex === index ? "ring-2 ring-sand-500" : ""
              }`}
              style={{
                backgroundColor: getTokenBackground(token.score),
                boxShadow: `inset 0 0 0 1px ${getTokenBorder(token.score)}`,
              }}
            >
              <span className="whitespace-pre-wrap">{token.text}</span>
            </button>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-sand-200 bg-sand-50 px-4 py-3 text-sm leading-6 text-sand-700">
          {activeToken ? (
            <>
              <p className="font-semibold text-sand-950">
                Token score: {activeToken.score.toFixed(2)}
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                Token: <code>{activeToken.text}</code>
              </p>
              {activeToken.note ? <p className="mt-2">{activeToken.note}</p> : null}
            </>
          ) : (
            <p>Select a token to inspect its relative loss contribution.</p>
          )}
        </div>
      </div>
    </figure>
  );
}
