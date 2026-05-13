/* 4b: Custom hook — separates form state, persistence, and submission logic from the page component */
"use client";

import { useEffect, useMemo, useState } from "react";
import { tools } from "../lib/pricing";
import type { AuditInput, AuditResult, ToolInput, UseCase } from "../lib/types";

const storageKey = "stacktrim-form";

const defaultTools: ToolInput[] = tools.map((tool) => ({
  id: tool.id,
  plan: tool.plans[0]?.label ?? "API direct",
  seats: 1,
  monthlySpend: tool.plans[0]?.monthlyPerSeat ?? 0,
}));

export function useAuditForm() {
  const [teamSize, setTeamSize] = useState(6);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [toolInputs, setToolInputs] = useState<ToolInput[]>(defaultTools);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore form state from localStorage on mount
  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    const parsed = JSON.parse(saved) as AuditInput;
    setTeamSize(parsed.teamSize);
    setUseCase(parsed.useCase);
    setToolInputs(parsed.tools);
  }, []);

  // Persist form state to localStorage on every change
  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ teamSize, useCase, tools: toolInputs }),
    );
  }, [teamSize, useCase, toolInputs]);

  const total = useMemo(
    () =>
      toolInputs.reduce((sum, tool) => sum + Number(tool.monthlySpend || 0), 0),
    [toolInputs],
  );

  const hasSpend = useMemo(
    () => toolInputs.some((tool) => tool.monthlySpend > 0),
    [toolInputs],
  );

  function updateTool(index: number, patch: Partial<ToolInput>) {
    setToolInputs((current) =>
      current.map((tool, i) => (i === index ? { ...tool, ...patch } : tool)),
    );
  }

  function dismissError() {
    setError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          teamSize,
          useCase,
          tools: toolInputs.filter((tool) => tool.monthlySpend > 0),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Audit failed (${response.status})`);
      }
      setResult((await response.json()) as AuditResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    teamSize,
    setTeamSize,
    useCase,
    setUseCase,
    toolInputs,
    updateTool,
    result,
    loading,
    error,
    dismissError,
    submit,
    total,
    hasSpend,
  };
}
