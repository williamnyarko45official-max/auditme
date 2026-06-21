import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuditMe — Your Coding Agent's Security Sidekick",
  description:
    "MCP server, LSP server, and web app for production-readiness analysis. Powered by NVIDIA Nemotron. Free and open source.",
  icons: {
    icon: { url: "/icon.svg", type: "image/svg+xml" },
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "AuditMe — Your Coding Agent's Security Sidekick",
    description:
      "MCP server, LSP server, CLI, and web app for production-readiness analysis. Catches secrets, code smells, and bugs before you ship. Free and open source.",
    url: "https://auditme-six.vercel.app",
    siteName: "AuditMe",
    images: [{ url: "/opengraph-image.svg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuditMe — Your Coding Agent's Security Sidekick",
    description:
      "MCP server, LSP server, CLI, and web app for production-readiness analysis. Free and open source.",
    images: ["/opengraph-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
