import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tolochko.dev"),
  title: "Oleg Tolochko",
  description:
    "Oleg Tolochko, M.Sc. Informatics student at TU Munich working on 3D computer vision: point cloud completion, Gaussian splatting and uncertainty.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "any" }],
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Oleg Tolochko",
    description: "3D computer vision, TU Munich.",
    url: "https://tolochko.dev",
    images: ["/assets/portrait-square.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
