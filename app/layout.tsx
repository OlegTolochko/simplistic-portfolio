import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oleg Tolochko - Portfolio",
  description: "A simplistic portfolio website.",
  icons: {
    icon: [
      { url: '/favicon2.ico', type: 'image/x-icon', sizes: 'any' },
    ],
    shortcut: '/favicon2.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-sand-100`}>
        {children}
      </body>
    </html>
  );
}