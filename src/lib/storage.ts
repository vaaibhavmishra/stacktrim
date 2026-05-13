import { promises as fs } from "node:fs";
import path from "node:path";
import type { AuditResult, LeadInput } from "./types";

const localFile = path.join(process.cwd(), "local-audits.json");

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

// 6a: Fail fast if Supabase is partially configured
const _supabaseUrl = env("SUPABASE_URL");
const _supabaseKey = env("SUPABASE_SERVICE_ROLE_KEY");
if (_supabaseUrl && !_supabaseKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required when SUPABASE_URL is set",
  );
}
if (!_supabaseUrl && _supabaseKey) {
  throw new Error(
    "SUPABASE_URL is required when SUPABASE_SERVICE_ROLE_KEY is set",
  );
}

export function makeId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export async function saveAudit(result: AuditResult): Promise<AuditResult> {
  const id = result.id ?? makeId();
  const saved = { ...result, id };
  const supabaseUrl = env("SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");

  if (supabaseUrl && serviceKey) {
    const response = await fetch(`${supabaseUrl}/rest/v1/audits`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ id, payload: saved }),
    });
    if (!response.ok)
      throw new Error(`Supabase audit save failed: ${response.status}`);
    return saved;
  }

  const data = await readLocal();
  data.audits[id] = saved;
  await fs.writeFile(localFile, JSON.stringify(data, null, 2));
  return saved;
}

export async function getAudit(id: string): Promise<AuditResult | null> {
  const supabaseUrl = env("SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");

  if (supabaseUrl && serviceKey) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/audits?id=eq.${encodeURIComponent(id)}&select=payload`,
      {
        headers: {
          apikey: serviceKey,
          authorization: `Bearer ${serviceKey}`,
        },
        cache: "no-store",
      },
    );
    if (!response.ok)
      throw new Error(`Supabase audit fetch failed: ${response.status}`);
    const rows = (await response.json()) as { payload: AuditResult }[];
    return rows[0]?.payload ?? null;
  }

  const data = await readLocal();
  return data.audits[id] ?? null;
}

export async function saveLead(lead: LeadInput): Promise<void> {
  const supabaseUrl = env("SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");

  if (supabaseUrl && serviceKey) {
    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audit_id: lead.auditId,
        email: lead.email,
        company: lead.company ?? null,
        role: lead.role ?? null,
        team_size: lead.teamSize ?? null,
      }),
    });
    if (!response.ok)
      throw new Error(`Supabase lead save failed: ${response.status}`);
  }

  await sendConfirmation(lead);
}

async function sendConfirmation(lead: LeadInput): Promise<void> {
  const resendKey = env("RESEND_API_KEY");
  const from = env("RESEND_FROM_EMAIL") ?? "StackTrim <audits@example.com>";
  if (!resendKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${resendKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: lead.email,
      subject: "Your StackTrim AI spend audit",
      html: `<p>Your AI spend audit is ready.</p><p>Public report: ${env("NEXT_PUBLIC_APP_URL") ?? ""}/audit/${lead.auditId}</p><p>If the audit found a high-savings opportunity, Credex can help turn the savings into credits and procurement leverage.</p>`,
    }),
  });
}

async function readLocal(): Promise<{ audits: Record<string, AuditResult> }> {
  try {
    return JSON.parse(await fs.readFile(localFile, "utf8")) as {
      audits: Record<string, AuditResult>;
    };
  } catch {
    return { audits: {} };
  }
}
