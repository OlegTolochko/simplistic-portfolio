import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

import Aside from "@/components/mdx/aside";
import Callout from "@/components/mdx/callout";
import Figure from "@/components/mdx/figure";
import Metric from "@/components/mdx/metric";
import TokenHeatmap from "@/components/mdx/token-heatmap";
import TokenTable from "@/components/mdx/token-table";

function ResponsiveTable({ children }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-sand-300 bg-sand-50 shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm text-sand-900">
        {children}
      </table>
    </div>
  );
}

const components: MDXComponents = {
  a: ({ href = "", children, ...props }) => {
    const isInternal = href.startsWith("/");

    if (isInternal) {
      return (
        <Link
          href={href}
          className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 transition-colors hover:text-blue-800"
          {...props}
        >
          {children}
        </Link>
      );
    }

    return (
      <a
        href={href}
        className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 transition-colors hover:text-blue-800"
        rel="noreferrer"
        target="_blank"
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ src = "", alt = "", ...props }) => (
    <img
      src={src}
      alt={alt}
      className="my-8 w-full rounded-3xl border border-sand-300 bg-sand-50 object-cover shadow-sm"
      {...props}
    />
  ),
  table: ResponsiveTable,
  th: ({ children, ...props }) => (
    <th className="border-b border-sand-300 bg-sand-100 px-4 py-3 font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-b border-sand-200 px-4 py-3 align-top" {...props}>
      {children}
    </td>
  ),
  pre: ({ children, className, ...props }) => (
    <pre
      className={twMerge(
        "my-8 overflow-x-auto rounded-3xl border border-stone-900 bg-stone-950 p-5 text-sm text-stone-50 shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) => (
    typeof className === "string" && className.includes("language-") ? (
      <code
        className={twMerge(
          "block whitespace-pre text-sm leading-7 text-stone-50",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    ) : (
      <code
        className={twMerge(
          "rounded bg-sand-200 px-1.5 py-0.5 text-[0.95em] text-sand-900",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    )
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-8 rounded-r-2xl border-l-4 border-blue-500 bg-blue-50 px-5 py-4 text-sand-800"
      {...props}
    >
      {children}
    </blockquote>
  ),
  Aside,
  Callout,
  Figure,
  Metric,
  TokenHeatmap,
  TokenTable,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
