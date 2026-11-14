import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Baloo_2, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Baloo 2: títulos redondos y amables. Atkinson Hyperlegible: hecha para leerse fácil.
const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["latin"], weight: ["600", "800"] });
const atkinson = Atkinson_Hyperlegible({ variable: "--font-atkinson", subsets: ["latin"], weight: ["400", "700"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mi Parcela",
  description: "Rotación de cultivos para pequeños agricultores de Honduras, con datos de NASA POWER.",
};

export const viewport: Viewport = {
  themeColor: "#1F7A3D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${baloo.variable} ${atkinson.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
