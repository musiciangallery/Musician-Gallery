import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Self-hosted via Next.js instead of a <link> to Google's font CDN — that
// used to mean every visitor's browser made a separate trip out to
// fonts.googleapis.com before any headline text could render. This bundles
// the same font files onto Vercel's own servers alongside the rest of the
// site, and preloads them, cutting that extra round trip out entirely.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Musician Gallery",
  description: "A home for New Zealand musicians. Trusted and discoverable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col bg-w text-dark">
        <Nav />
        <main className="flex-1 pt-[96px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
