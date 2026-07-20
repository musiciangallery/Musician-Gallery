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
  // Gives Next.js an absolute URL to resolve the opengraph-image /
  // twitter-image files against — without it, shared links can end up
  // pointing at the wrong domain (or localhost) when platforms fetch the
  // preview image.
  metadataBase: new URL("https://musiciangallery.co.nz"),
  title: "Musician Gallery",
  description: "A home for New Zealand musicians. Trusted and discoverable.",
  // Plain "description" above covers browser tabs and search results.
  // openGraph/twitter are what Facebook, LinkedIn, Slack, iMessage, etc.
  // actually read when generating a share preview — without these, most
  // platforms show a blank or incomplete card even with the share image
  // in place.
  openGraph: {
    title: "Musician Gallery",
    description: "A home for New Zealand musicians. Trusted and discoverable.",
    url: "https://musiciangallery.co.nz",
    siteName: "Musician Gallery",
    locale: "en_NZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Musician Gallery",
    description: "A home for New Zealand musicians. Trusted and discoverable.",
  },
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
