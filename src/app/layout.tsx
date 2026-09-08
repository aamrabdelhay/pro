import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-plex-ar",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Safa Rosy — Beauty, decoded for you",
  description:
    "A beauty store with Rosy: a free AI consultant that asks smart questions about your skin, hair, and body — then matches you with the right products from the live catalog.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${fraunces.variable} ${plexArabic.variable} bg-blush font-sans text-neutral-800 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
