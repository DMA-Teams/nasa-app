import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter es la tipografía de la marca Surco (pesos 400 y 600)
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Surco",
  description: "Qué sembrar en tu terreno en Honduras, con datos de NASA POWER.",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#155E4B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
