import type { ReactNode } from "react";

export default function Aside({ children }: { children: ReactNode }) {
  return (
    <aside className="my-8 rounded-[1.75rem] border border-sand-300 bg-sand-50 px-5 py-4 text-base leading-7 text-sand-700 shadow-sm">
      {children}
    </aside>
  );
}
