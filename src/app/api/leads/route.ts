import { NextResponse } from "next/server";
import { saveLead } from "@/lib/storage";
import type { LeadInput } from "@/lib/types";

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = hits.get(ip);
  if (!existing || existing.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  existing.count += 1;
  return existing.count <= 5;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(ip))
    return NextResponse.json(
      { error: "Too many submissions." },
      { status: 429 },
    );

  const lead = (await request.json()) as LeadInput;
  if (lead.website) return NextResponse.json({ ok: true });
  if (!lead.email || !lead.email.includes("@") || !lead.auditId) {
    return NextResponse.json(
      { error: "A valid email and audit id are required." },
      { status: 400 },
    );
  }

  await saveLead(lead);
  return NextResponse.json({ ok: true });
}
