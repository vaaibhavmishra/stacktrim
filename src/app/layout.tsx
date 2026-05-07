import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen bg-[#f7f8f4] font-sans text-[#17201b] antialiased">{children}</body>
    </html>
  );
}
