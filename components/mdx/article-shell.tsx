import Link from "next/link";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";

const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--serif" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mono" });

type ArticleShellProps = {
  eyebrow?: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  readingTimeMinutes: number;
  stack?: string[];
  heroImage?: string;
  children: ReactNode;
  actions?: ReactNode;
};

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export default function ArticleShell({
  eyebrow = "Project",
  title,
  summary,
  publishedAt,
  updatedAt,
  readingTimeMinutes,
  stack = [],
  heroImage,
  actions,
  children,
}: ArticleShellProps) {
  return (
    <div className={`${serif.variable} ${mono.variable} min-h-screen bg-[#f3f3f0] text-[#1c1b19]`}>
      <article className="mx-auto max-w-[760px] px-5 pb-24 pt-10 font-[family-name:var(--serif)] sm:px-7">
        <nav className="mb-16 font-[family-name:var(--mono)] text-[12px] text-[#6b6962]">
          <Link href="/" className="hover:text-[#1c1b19]">
            ← Oleg Tolochko
          </Link>
        </nav>

        <header>
          <p className="font-[family-name:var(--mono)] text-[12px] uppercase tracking-[0.08em] text-[#6b6962]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,2.9rem)] font-medium leading-[1.1] tracking-[-0.015em]">{title}</h1>
          <p className="mt-5 text-[1.2rem] italic leading-[1.5] text-[#4a4843]">{summary}</p>

          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 font-[family-name:var(--mono)] text-[12px] text-[#6b6962]">
            <span>{formatDate(publishedAt)}</span>
            <span>{readingTimeMinutes} min read</span>
            {updatedAt ? <span>updated {formatDate(updatedAt)}</span> : null}
            {stack.length > 0 ? <span>{stack.join(" · ")}</span> : null}
          </p>

          {actions ? <div className="mt-5">{actions}</div> : null}

          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="" className="mt-10 w-full border border-[#d9d8d0] bg-white" />
          ) : null}
        </header>

        <div className="mt-10 text-[1.12rem] leading-[1.7] [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:text-[1.6rem] [&_h2]:font-medium [&_h2]:leading-tight [&_h2]:tracking-[-0.01em] [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-[1.25rem] [&_h3]:font-medium [&_li]:my-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_strong]:font-semibold [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </article>
    </div>
  );
}
