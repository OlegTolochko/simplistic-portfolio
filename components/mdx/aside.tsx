import type { ReactNode } from "react";

export default function Aside({ children }: { children: ReactNode }) {
  return <aside className="my-8 border-l-2 border-[#d9d8d0] pl-5 text-[1rem] leading-7 text-[#4a4843]">{children}</aside>;
}
