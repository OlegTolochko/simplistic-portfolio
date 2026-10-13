import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import Aside from "@/components/mdx/aside";
import Callout from "@/components/mdx/callout";
import Figure from "@/components/mdx/figure";
import Metric from "@/components/mdx/metric";

const linkClass = "text-[#2f6ea5] underline decoration-[#2f6ea5]/30 underline-offset-[3px] hover:decoration-[#2f6ea5]";

const components: MDXComponents = {
  a: ({ href = "", children, ...props }) =>
    href.startsWith("/") ? (
      <Link href={href} className={linkClass} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} className={linkClass} rel="noreferrer" target="_blank" {...props}>
        {children}
      </a>
    ),
  img: ({ src = "", alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="my-8 w-full border border-[#d9d8d0] bg-white" {...props} />
  ),
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto">
      <table className="min-w-full border-y border-[#1c1b19] text-left text-[0.95rem]">{children}</table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border-b border-[#1c1b19] px-3 py-2 font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-3 py-2 align-top" {...props}>
      {children}
    </td>
  ),
  pre: ({ children, ...props }) => (
    <pre className="my-8 overflow-x-auto bg-[#1c1b19] p-5 text-[13px] leading-6 text-[#f3f3f0]" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) =>
    typeof className === "string" && className.includes("language-") ? (
      <code className={`block whitespace-pre font-[family-name:var(--mono)] ${className}`} {...props}>
        {children}
      </code>
    ) : (
      <code className="bg-[#e6e5de] px-1 py-px font-[family-name:var(--mono)] text-[0.85em]" {...props}>
        {children}
      </code>
    ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="my-8 border-l-2 border-[#1c1b19] pl-5 italic text-[#4a4843]" {...props}>
      {children}
    </blockquote>
  ),
  Aside,
  Callout,
  Figure,
  Metric,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
