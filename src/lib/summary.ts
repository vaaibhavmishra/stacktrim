import { fallbackSummary } from "./audit";
import type { AuditResult } from "./types";

export async function generateSummary(result: AuditResult): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fallbackSummary(result);

  const prompt = `Write a concise, finance-literate AI software spend audit summary in about 100 words.
Use plain English. Mention total monthly savings, annual savings, and the largest concrete recommendation.
Do not invent facts. Do not mention private lead details.

Audit JSON:
${JSON.stringify({
    totalCurrentSpend: result.totalCurrentSpend,
    totalMonthlySavings: result.totalMonthlySavings,
    totalAnnualSavings: result.totalAnnualSavings,
    verdict: result.verdict,
    recommendations: result.recommendations.map((item) => ({
      tool: item.toolName,
      action: item.recommendedAction,
      savings: item.monthlySavings,
      reason: item.reason
    }))
  })}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
        max_tokens: 180,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) return fallbackSummary(result);
    const data = (await response.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((block) => block.type === "text")?.text?.trim();
    return text || fallbackSummary(result);
  } catch {
    return fallbackSummary(result);
  }
}
