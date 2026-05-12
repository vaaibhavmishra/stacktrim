import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAudit } from "@/lib/storage";
import { Nav } from "../../components/nav";
import { Results } from "../../components/results";

interface Props {
  params: Promise<{ id: string }>;
}

// 6d: Public reports rarely change — revalidate hourly to avoid hitting Supabase on every view
export const revalidate = 3600;

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
      <Nav rightLabel="Public report" />
      <Results result={audit} publicView />
    </main>
  );
}
