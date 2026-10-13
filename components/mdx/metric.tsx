import type { MetricProps } from "./types";

export default function Metric({ label, value, detail }: MetricProps) {
  return (
    <div className="my-6 border-t border-[#1c1b19] pt-3">
      <p className="!my-0 font-[family-name:var(--mono)] text-[12px] uppercase tracking-[0.08em] text-[#6b6962]">{label}</p>
      <p className="!my-1 text-3xl font-medium">{value}</p>
      {detail ? <p className="!my-0 text-[0.95rem] text-[#6b6962]">{detail}</p> : null}
    </div>
  );
}
