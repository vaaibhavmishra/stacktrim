import type { ToolId, UseCase } from "./types";

export interface PlanPrice {
  label: string;
  monthlyPerSeat: number | null;
  minimumSeats?: number;
  notes?: string;
}

export interface ToolPricing {
  id: ToolId;
  name: string;
  category: "coding" | "assistant" | "api";
  plans: PlanPrice[];
}

export const verifiedAt = "2026-05-11";

export const tools: ToolPricing[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    plans: [
      { label: "Hobby", monthlyPerSeat: 0 },
      { label: "Pro", monthlyPerSeat: 20 },
      { label: "Business", monthlyPerSeat: 40, notes: "Cursor calls this Teams on its pricing page." },
      { label: "Enterprise", monthlyPerSeat: null }
    ]
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "coding",
    plans: [
      { label: "Individual", monthlyPerSeat: 10 },
      { label: "Business", monthlyPerSeat: 19 },
      { label: "Enterprise", monthlyPerSeat: 39 }
    ]
  },
  {
    id: "claude",
    name: "Claude",
    category: "assistant",
    plans: [
      { label: "Free", monthlyPerSeat: 0 },
      { label: "Pro", monthlyPerSeat: 20 },
      { label: "Max", monthlyPerSeat: 100 },
      { label: "Team", monthlyPerSeat: 25, minimumSeats: 5 },
      { label: "Enterprise", monthlyPerSeat: null, notes: "Custom contract pricing." },
      { label: "API direct", monthlyPerSeat: null }
    ]
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "assistant",
    plans: [
      { label: "Plus", monthlyPerSeat: 20 },
      { label: "Team", monthlyPerSeat: 25, minimumSeats: 2, notes: "OpenAI now labels this ChatGPT Business." },
      { label: "Enterprise", monthlyPerSeat: null },
      { label: "API direct", monthlyPerSeat: null }
    ]
  },
  {
    id: "anthropic-api",
    name: "Anthropic API direct",
    category: "api",
    plans: [{ label: "API direct", monthlyPerSeat: null }]
  },
  {
    id: "openai-api",
    name: "OpenAI API direct",
    category: "api",
    plans: [{ label: "API direct", monthlyPerSeat: null }]
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "assistant",
    plans: [
      { label: "Pro", monthlyPerSeat: 19.99 },
      { label: "Ultra", monthlyPerSeat: 249.99 },
      { label: "API", monthlyPerSeat: null }
    ]
  },
  {
    id: "windsurf",
    name: "Windsurf",
    category: "coding",
    plans: [
      { label: "Free", monthlyPerSeat: 0 },
      { label: "Pro", monthlyPerSeat: 20 },
      { label: "Teams", monthlyPerSeat: 40 },
      { label: "Enterprise", monthlyPerSeat: null }
    ]
  }
];

export const toolMap = new Map(tools.map((tool) => [tool.id, tool]));

export function nominalSpend(toolId: ToolId, plan: string, seats: number): number | null {
  const tool = toolMap.get(toolId);
  const matched = tool?.plans.find((candidate) => candidate.label.toLowerCase() === plan.toLowerCase());
  if (!matched || matched.monthlyPerSeat === null) return null;
  const billableSeats = Math.max(seats, matched.minimumSeats ?? 1);
  return roundMoney(matched.monthlyPerSeat * billableSeats);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const useCaseLabels: Record<UseCase, string> = {
  coding: "Coding",
  writing: "Writing",
  data: "Data analysis",
  research: "Research",
  mixed: "Mixed workflows"
};
