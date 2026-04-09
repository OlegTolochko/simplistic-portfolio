import type { CalloutProps } from "./token-types";

const toneClasses = {
  info: "border-blue-200 bg-blue-50 text-blue-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

export default function Callout({ title, tone = "info", children }: CalloutProps) {
  return (
    <aside className={`my-8 rounded-[1.75rem] border px-5 py-4 shadow-sm ${toneClasses[tone]}`}>
      {title ? <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]">{title}</p> : null}
      <div className="text-base leading-7">{children}</div>
    </aside>
  );
}
