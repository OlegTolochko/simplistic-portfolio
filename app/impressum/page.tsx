import React from 'react';

export const metadata = {
  title: 'Impressum',
  description: 'Impressum - Legal Information',
};

export default function Impressum() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Impressum</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
        <p>Oleg Tolochko</p>
        <p>Vockestraße 35</p>
        <p>85540 Haar</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
        <p>E-Mail: oleg.i.tolochko@gmail.com</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p>Oleg Tolochko</p>
        <p>Vockestraße 35</p>
        <p>85540 Haar</p>
      </section>
    </div>
  );
}