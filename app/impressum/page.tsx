import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum | Oleg Tolochko",
  description: "Impressum - Legal Information",
};

export default function Impressum() {
  return (
    <main className="min-h-screen bg-[#f3f3f0] text-[#1c1b19]">
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-10 font-sans text-[16px] leading-7">
        <Link href="/" className="font-mono text-[12px] text-[#6b6962] hover:text-[#1c1b19]">
          ← Oleg Tolochko
        </Link>

        <h1 className="mb-10 mt-16 text-[2rem] font-semibold tracking-tight">Impressum</h1>

        <section className="mb-10">
          <h2 className="mb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[#6b6962]">
            Angaben gemäß § 5 TMG
          </h2>
          <p>Oleg Tolochko</p>
          <p>Vockestraße 35</p>
          <p>85540 Haar</p>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[#6b6962]">Kontakt</h2>
          <p>E-Mail: oleg.i.tolochko@gmail.com</p>
        </section>

        <section>
          <h2 className="mb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[#6b6962]">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p>Oleg Tolochko</p>
          <p>Vockestraße 35</p>
          <p>85540 Haar</p>
        </section>
      </div>
    </main>
  );
}
