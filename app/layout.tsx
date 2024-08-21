import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oleg Tolochko - Portfolio",
  description: "A simple portfolio template",
  icons: {
    icon: "/t-white.ico",
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