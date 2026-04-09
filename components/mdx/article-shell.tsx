import Image from "next/image";
import type { ReactNode } from "react";

type ArticleShellProps = {
  eyebrow?: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  readingTimeMinutes: number;
  tags?: string[];
  heroImage?: string;
  children: ReactNode;
  preamble?: ReactNode;
  actions?: ReactNode;
};

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArticleShell({
  eyebrow = "Writing",
  title,
  summary,
  publishedAt,
  updatedAt,
  readingTimeMinutes,
  tags = [],
  heroImage,
  preamble,
  actions,
  children,
}: ArticleShellProps) {
  return (
    <article className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
      <header className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">{eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-sand-950 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-stone-700 sm:text-xl">{summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-stone-600">
          <span>{formatDate(publishedAt)}</span>
          <span className="text-stone-400">/</span>
          <span>{readingTimeMinutes} min read</span>
          {updatedAt ? (
            <>
              <span className="text-stone-400">/</span>
              <span>Updated {formatDate(updatedAt)}</span>
            </>
          ) : null}
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {actions}

        {heroImage ? (
          <div className="overflow-hidden rounded-[2rem] border border-sand-300 bg-sand-50 shadow-sm">
            <Image
              src={heroImage}
              alt={title}
              width={1600}
              height={900}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        ) : null}
      </header>

      {preamble ? <div className="mt-10">{preamble}</div> : null}

      <div
        className="
          mt-12 text-[17px] leading-8 text-stone-800
          [&_h2]:mt-14 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-sand-950
          [&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:leading-tight [&_h3]:text-sand-950
          [&_h4]:mt-8 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-sand-950
          [&_p]:my-6 [&_p]:leading-8 [&_p]:text-stone-800
          [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6
          [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6
          [&_li]:my-2 [&_li]:text-stone-800
          [&_hr]:my-12 [&_hr]:border-sand-300
          [&_strong]:font-semibold [&_strong]:text-sand-950
        "
      >
        {children}
      </div>
    </article>
  );
}
