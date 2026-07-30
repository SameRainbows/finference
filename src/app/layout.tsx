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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://finference-ai.vercel.app",
  ),
  title: {
    default: "Finference — AI margin control plane",
    template: "%s · Finference",
  },
  description:
    "Measure inference cost per customer, protect gross margin, and automate usage-based billing from one auditable control plane.",
  openGraph: {
    title: "Finference — AI margin control plane",
    description:
      "Turn every AI request into durable unit economics. Observe, optimize, govern, and bill.",
    type: "website",
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
