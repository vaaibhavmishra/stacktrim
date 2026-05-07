import { nominalSpend, roundMoney, toolMap } from "./pricing";
import type { AuditInput, AuditResult, RecommendationKind, ToolInput, ToolRecommendation } from "./types";

function action(
  tool: ToolInput,
  recommendedSpend: number,
  recommendedAction: string,
  reason: string,
  kind: RecommendationKind
): ToolRecommendation {
  const currentSpend = Math.max(0, tool.monthlySpend);
  const monthlySavings = Math.max(0, roundMoney(currentSpend - recommendedSpend));
  return {
    toolId: tool.id,
    toolName: toolMap.get(tool.id)?.name ?? tool.id,
    currentPlan: tool.plan,
    currentSpend,
    recommendedAction,
    recommendedSpend: roundMoney(recommendedSpend),
    monthlySavings,
    annualSavings: roundMoney(monthlySavings * 12),
    reason,
    kind
  };
}

function keep(tool: ToolInput, reason: string): ToolRecommendation {
  return action(tool, tool.monthlySpend, "Keep current setup", reason, "keep");
}

function targetSpend(tool: ToolInput, plan: string, fallback: number): number {
  return nominalSpend(tool.id, plan, tool.seats) ?? fallback;
}

function auditTool(input: AuditInput, tool: ToolInput): ToolRecommendation {
  const plan = tool.plan.toLowerCase();
  const seats = Math.max(1, tool.seats);
  const teamSize = Math.max(1, input.teamSize);
  const useCase = input.useCase;

  if (tool.id === "cursor") {
    if (plan === "enterprise" && teamSize < 50) {
      const spend = targetSpend(tool, "Business", 40 * seats);
      return action(tool, spend, "Downgrade to Cursor Business", "Enterprise controls are usually hard to justify below 50 users; Business keeps centralized billing and admin controls at $40/user.", "downgrade");
    }
    if (plan === "business" && seats < 3) {
      const spend = targetSpend(tool, "Pro", 20 * seats);
      return action(tool, spend, "Move the small group to Cursor Pro", "For one or two users, Business admin overhead rarely offsets the extra $20/user over Pro.", "downgrade");
    }
    if (plan === "pro" && useCase !== "coding") {
      return action(tool, 0, "Cancel Cursor for non-coding users", "Cursor is priced for coding workflows; writing, research, and data teams usually get better value from a general assistant they already use.", "switch");
    }
    return keep(tool, "Cursor pricing matches the coding use case and seat count.");
  }

  if (tool.id === "github-copilot") {
    if (plan === "enterprise" && teamSize < 50) {
      const spend = targetSpend(tool, "Business", 19 * seats);
      return action(tool, spend, "Downgrade Copilot Enterprise to Business", "Copilot Enterprise costs $20/user more than Business; smaller teams rarely need enterprise codebase customization across GitHub.", "downgrade");
    }
    if (plan === "business" && seats === 1) {
      const spend = targetSpend(tool, "Individual", 10);
      return action(tool, spend, "Use Copilot Individual", "A single paid user does not need organization policy management, so Individual preserves core coding assistance for less.", "downgrade");
    }
    if (useCase !== "coding" && tool.monthlySpend > 0) {
      return action(tool, 0, "Remove Copilot seats from non-developers", "Copilot value is concentrated in IDE and GitHub coding workflows; non-coding seats are almost pure waste.", "switch");
    }
    return keep(tool, "Copilot plan fits the coding-heavy usage profile.");
  }

  if (tool.id === "claude") {
    if (plan === "team" && seats < 5) {
      const spend = targetSpend(tool, "Pro", 20 * seats);
      return action(tool, spend, "Use Claude Pro until you reach 5 active users", "Claude Team has a five-seat floor; small teams pay for unused seats unless they need SSO immediately.", "downgrade");
    }
    if (plan === "max" && useCase !== "coding" && useCase !== "research" && tool.monthlySpend / seats >= 100) {
      const spend = targetSpend(tool, "Pro", 20 * seats);
      return action(tool, spend, "Downgrade Max users to Claude Pro", "Max is defensible for daily heavy reasoning or Claude Code; lighter writing and mixed use usually fits Pro.", "downgrade");
    }
    if (plan === "enterprise" && teamSize < 20) {
      const spend = targetSpend(tool, "Team", 25 * Math.max(seats, 5));
      return action(tool, spend, "Use Claude Team before Enterprise", "Claude self-serve Enterprise has a 20-seat annual commitment; Team is a cleaner fit for smaller groups.", "downgrade");
    }
    return keep(tool, "Claude spend appears aligned with team size and usage intensity.");
  }

  if (tool.id === "chatgpt") {
    if (plan === "team" && seats === 1) {
      const spend = targetSpend(tool, "Plus", 20);
      return action(tool, spend, "Use ChatGPT Plus for a solo user", "ChatGPT Business requires at least two seats; a solo workflow can usually use Plus at $20/month.", "downgrade");
    }
    if (plan === "enterprise" && teamSize < 50) {
      const spend = targetSpend(tool, "Team", 25 * Math.max(seats, 2));
      return action(tool, spend, "Move to ChatGPT Business self-serve", "For teams below enterprise scale, Business gives admin controls and privacy without custom-contract pricing.", "downgrade");
    }
    if (plan === "api direct" && tool.monthlySpend > 250 && ["writing", "research", "mixed"].includes(useCase)) {
      const spend = targetSpend(tool, "Team", 25 * Math.max(seats, 2));
      return action(tool, spend, "Route casual internal usage through ChatGPT Business", "Seat subscriptions can cap unpredictable internal chat spend when usage is human-facing rather than product API traffic.", "credits");
    }
    return keep(tool, "ChatGPT plan is reasonable for the stated team size.");
  }

  if (tool.id === "gemini") {
    if (plan === "ultra" && useCase !== "data" && useCase !== "research" && tool.monthlySpend / seats > 200) {
      const spend = targetSpend(tool, "Pro", 19.99 * seats);
      return action(tool, spend, "Downgrade Gemini Ultra to Pro", "Ultra is priced for highest-limit research and media workflows; most general teams get similar assistant utility from Pro.", "downgrade");
    }
    if (plan === "api" && tool.monthlySpend > 100 && useCase !== "data") {
      const spend = targetSpend(tool, "Pro", 19.99 * seats);
      return action(tool, spend, "Cap exploratory Gemini usage with Pro seats", "Human exploratory usage should not sit on uncapped API billing unless it powers a product workflow.", "credits");
    }
    return keep(tool, "Gemini spend looks proportionate to the selected plan.");
  }

  if (tool.id === "windsurf") {
    if (plan === "teams" && seats < 3) {
      const spend = targetSpend(tool, "Pro", 20 * seats);
      return action(tool, spend, "Use Windsurf Pro until the team needs admin controls", "Teams doubles the per-seat price; below three users, admin analytics rarely justify the premium.", "downgrade");
    }
    if (useCase !== "coding" && tool.monthlySpend > 0) {
      return action(tool, 0, "Cancel Windsurf for non-coding use", "Windsurf is a coding agent; non-coding teams should not carry coding-editor subscriptions.", "switch");
    }
    return keep(tool, "Windsurf is a reasonable coding-tool subscription for this seat count.");
  }

  if (tool.id === "anthropic-api") {
    if (tool.monthlySpend > 100 && ["writing", "research", "mixed"].includes(useCase)) {
      const claudeSeats = Math.max(seats, Math.min(teamSize, seats || teamSize));
      const spend = 20 * claudeSeats;
      return action(tool, spend, "Move human Claude usage to Claude Pro seats", "If API spend is mostly employee prompting, $20 Pro seats create a predictable ceiling versus uncapped token usage.", "credits");
    }
    return keep(tool, "Direct Anthropic API spend is acceptable when it supports product or automated workflows.");
  }

  if (tool.id === "openai-api") {
    if (tool.monthlySpend > 125 && ["writing", "research", "mixed"].includes(useCase)) {
      const spend = 20 * Math.max(1, seats);
      return action(tool, spend, "Move internal chat usage to ChatGPT Plus or Business", "Retail API billing is efficient for product traffic, but human chat usage is often cheaper and more predictable on seats.", "credits");
    }
    return keep(tool, "OpenAI API spend is reasonable if it maps to product usage, automation, or batch processing.");
  }

  return keep(tool, "No optimization rule matched this tool.");
}

export function runAudit(input: AuditInput, summary = ""): AuditResult {
  const recommendations = input.tools
    .filter((tool) => tool.monthlySpend > 0 || tool.seats > 0)
    .map((tool) => auditTool(input, { ...tool, seats: Math.max(1, tool.seats), monthlySpend: roundMoney(tool.monthlySpend) }));

  const totalCurrentSpend = roundMoney(recommendations.reduce((sum, item) => sum + item.currentSpend, 0));
  const totalRecommendedSpend = roundMoney(recommendations.reduce((sum, item) => sum + item.recommendedSpend, 0));
  const totalMonthlySavings = roundMoney(recommendations.reduce((sum, item) => sum + item.monthlySavings, 0));
  const totalAnnualSavings = roundMoney(totalMonthlySavings * 12);
  const verdict = totalMonthlySavings > 500 ? "high-savings" : totalMonthlySavings < 100 ? "optimized" : "some-savings";

  return {
    createdAt: new Date().toISOString(),
    input,
    recommendations,
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    verdict,
    summary
  };
}

export function fallbackSummary(result: AuditResult): string {
  if (result.verdict === "optimized") {
    return `Your AI stack is already fairly disciplined at $${result.totalCurrentSpend.toLocaleString()}/mo. The audit found less than $100/mo in defensible cuts, so the best move is to keep monitoring plan changes and consolidate only when usage patterns become clearer.`;
  }

  const top = [...result.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  return `Your current stack is running about $${result.totalCurrentSpend.toLocaleString()}/mo, with roughly $${result.totalMonthlySavings.toLocaleString()}/mo in defensible savings. The biggest lever is ${top?.toolName ?? "plan rationalization"}: ${top?.recommendedAction.toLowerCase() ?? "review paid seats against actual usage"}. Annualized, that is $${result.totalAnnualSavings.toLocaleString()} that can be redirected to credits, infrastructure, or higher-value AI adoption work.`;
}
