import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GrainOverlay } from "@/components/chrome/GrainOverlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://askhemanth.com";
const SITE_NAME = "askhemanth";
const DESCRIPTION =
  "Engineer building with agents. Ask anything about Hemanth Kumar's background, projects, and current work.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Hemanth Kumar`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Hemanth Kumar" }],
  creator: "Hemanth Kumar",
  keywords: [
    "Hemanth Kumar",
    "AI agents",
    "Claude",
    "Anthropic",
    "Databricks",
    "data engineering",
    "Singapore",
    "Temus",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Engineer building with agents`,
    description: DESCRIPTION,
    locale: "en_SG",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Engineer building with agents`,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <GrainOverlay />
        <div className="relative flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
