import assert from "node:assert/strict";
import test from "node:test";
import { runAudit } from "../src/lib/audit";
import type { AuditInput } from "../src/lib/types";

test("downgrades Cursor Business for two users to Pro", () => {
  const result = runAudit({
    teamSize: 2,
    useCase: "coding",
    tools: [{ id: "cursor", plan: "Business", seats: 2, monthlySpend: 80 }]
  });
  assert.equal(result.totalMonthlySavings, 40);
  assert.match(result.recommendations[0]!.recommendedAction, /Cursor Pro/);
});

test("downgrades Copilot Enterprise for small teams to Business", () => {
  const result = runAudit({
    teamSize: 12,
    useCase: "coding",
    tools: [{ id: "github-copilot", plan: "Enterprise", seats: 12, monthlySpend: 468 }]
  });
  assert.equal(result.totalMonthlySavings, 240);
});

test("respects Claude Team five seat minimum when reducing to Pro", () => {
  const result = runAudit({
    teamSize: 3,
    useCase: "research",
    tools: [{ id: "claude", plan: "Team", seats: 3, monthlySpend: 125 }]
  });
  assert.equal(result.totalMonthlySavings, 65);
  assert.equal(result.recommendations[0]!.recommendedSpend, 60);
});

test("flags Gemini Ultra as overkill for mixed teams", () => {
  const result = runAudit({
    teamSize: 4,
    useCase: "mixed",
    tools: [{ id: "gemini", plan: "Ultra", seats: 2, monthlySpend: 499.98 }]
  });
  assert.equal(result.totalMonthlySavings, 460);
});

test("keeps optimized low-spend stack honest", () => {
  const input: AuditInput = {
    teamSize: 5,
    useCase: "coding",
    tools: [{ id: "github-copilot", plan: "Business", seats: 5, monthlySpend: 95 }]
  };
  const result = runAudit(input);
  assert.equal(result.verdict, "optimized");
  assert.equal(result.totalMonthlySavings, 0);
});

test("high savings verdict starts above five hundred dollars per month", () => {
  const result = runAudit({
    teamSize: 8,
    useCase: "writing",
    tools: [
      { id: "cursor", plan: "Business", seats: 8, monthlySpend: 320 },
      { id: "gemini", plan: "Ultra", seats: 3, monthlySpend: 749.97 }
    ]
  });
  assert.equal(result.verdict, "high-savings");
  assert.ok(result.totalMonthlySavings > 500);
});
