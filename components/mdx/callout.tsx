import type { CalloutProps } from "./types";

export default function Callout({ title, children }: CalloutProps) {
  return (
    <aside className="my-8 border-y border-[#1c1b19] py-4">
      {title ? (
        <p className="!my-0 mb-1 font-[family-name:var(--mono)] text-[12px] uppercase tracking-[0.08em] text-[#6b6962]">
          {title}
        </p>
      ) : null}
      <div className="text-[1.02rem] leading-7 [&_p]:my-1">{children}</div>
    </aside>
  );
}
