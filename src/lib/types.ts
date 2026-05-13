export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export interface ToolInput {
  id: ToolId;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  teamSize: number;
  useCase: UseCase;
  tools: ToolInput[];
}

export type RecommendationKind =
  | "keep"
  | "downgrade"
  | "switch"
  | "credits"
  | "review";

export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  kind: RecommendationKind;
}

export interface AuditResult {
  id?: string;
  createdAt: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  verdict: "high-savings" | "some-savings" | "optimized";
  summary: string;
}

export interface LeadInput {
  auditId: string;
  email: string;
  company?: string;
  role?: string;
  teamSize?: number;
  website?: string;
}
