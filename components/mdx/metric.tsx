import type { MetricProps } from "./token-types";

export default function Metric({ label, value, detail }: MetricProps) {
  return (
    <div className="my-6 rounded-[1.75rem] border border-sand-300 bg-sand-50 p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sand-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-sand-950">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-sand-600">{detail}</p> : null}
    </div>
  );
}
