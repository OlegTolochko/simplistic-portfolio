"use client";

import { useEffect } from "react";

/**
 * Next.js error boundary for /knowledge.
 * Catches ChunkLoadError (stale deploy) and auto-reloads once.
 */
export default function KnowledgeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkError =
      error.name === "ChunkLoadError" ||
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Failed to fetch dynamically imported module");

    if (isChunkError) {
      // Prevent infinite reload loop: only auto-reload once per session
      const key = "knowledge-chunk-reload";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return;
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F3F0]">
      <div className="max-w-md text-center space-y-4 p-8">
        <h2 className="text-xl font-bold text-sand-900">Something went wrong</h2>
        <p className="text-sm text-sand-700">
          A new version may have been deployed. Try refreshing.
        </p>
        <button
          onClick={() => {
            sessionStorage.removeItem("knowledge-chunk-reload");
            window.location.reload();
          }}
          className="px-4 py-2 rounded-lg bg-sand-300 text-sand-900 text-sm font-medium border border-sand-400 hover:bg-sand-400 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
