import Link from "next/link";
import type { Metadata } from "next";

import { getAllBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog | Oleg Tolochko",
  description: "Technical writing and longer-form notes.",
};

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Blog</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-sand-950 sm:text-5xl">
          Long-form notes, experiments, and technical writeups.
        </h1>
      </div>

      <div className="mt-16 space-y-6">
        {posts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-sand-300 bg-sand-50 px-6 py-10 text-sand-600">
            No blog posts published yet.
          </div>
        ) : null}

        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-[2rem] border border-sand-300 bg-sand-50 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-wrap items-center gap-3 text-sm text-sand-600">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="text-sand-400">/</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-sand-950">{post.title}</h2>
            <p className="mt-3 text-base leading-7 text-sand-700">
              {post.subtitle ?? post.summary}
            </p>

            {post.tags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-sand-300 bg-sand-100 px-3 py-1 text-sm font-medium text-sand-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
