import { NextResponse } from "next/server";
import { runAudit } from "@/lib/audit";
import { saveAudit } from "@/lib/storage";
import { generateSummary } from "@/lib/summary";
import type { AuditInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as AuditInput;
    if (!Array.isArray(input.tools) || input.tools.length === 0) {
      return NextResponse.json(
        { error: "Add at least one paid tool." },
        { status: 400 },
      );
    }

    const initial = runAudit(input);
    const summary = await generateSummary(initial);
    const saved = await saveAudit({ ...initial, summary });
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit failed" },
      { status: 500 },
    );
  }
}
