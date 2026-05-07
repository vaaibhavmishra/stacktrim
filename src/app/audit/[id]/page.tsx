import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAudit } from "@/lib/storage";
import { Results } from "../../components/results";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) return {};
  const title = `$${audit.totalMonthlySavings.toLocaleString()}/mo AI savings found`;
  const description = `StackTrim audited an AI tool stack and found $${audit.totalAnnualSavings.toLocaleString()} in annual potential savings.`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/audit/${id}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function AuditPage({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();

  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between border-b border-[#dfe5da] px-[clamp(18px,4vw,56px)] py-[18px]">
        <Link href="/" className="text-lg font-extrabold text-[#113b28] no-underline">StackTrim</Link>
        <span>Public report</span>
      </nav>
      <Results result={audit} publicView />
    </main>
  );
}
