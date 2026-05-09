import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "StackTrim AI Spend Audit",
  description: "Find overspend across AI subscriptions and API tools.",
  openGraph: {
    title: "StackTrim AI Spend Audit",
    description: "Find overspend across AI subscriptions and API tools.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "StackTrim AI Spend Audit",
    description: "Find overspend across AI subscriptions and API tools."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen bg-[var(--color-bg)] font-[var(--font-dm-sans),ui-sans-serif,system-ui,sans-serif] text-[var(--color-text-primary)] antialiased">{children}</body>
    </html>
  );
}
