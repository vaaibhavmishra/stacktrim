"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tools, useCaseLabels } from "@/lib/pricing";
import type { AuditInput, AuditResult, ToolInput, UseCase } from "@/lib/types";
import { Results } from "./components/results";

const storageKey = "stacktrim-form";

const defaultTools: ToolInput[] = tools.map((tool) => ({
  id: tool.id,
  plan: tool.plans[0]?.label ?? "API direct",
  seats: 1,
  monthlySpend: tool.plans[0]?.monthlyPerSeat ?? 0
}));

export default function Home() {
  const [teamSize, setTeamSize] = useState(6);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [toolInputs, setToolInputs] = useState<ToolInput[]>(defaultTools);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    const parsed = JSON.parse(saved) as AuditInput;
    setTeamSize(parsed.teamSize);
    setUseCase(parsed.useCase);
    setToolInputs(parsed.tools);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ teamSize, useCase, tools: toolInputs }));
  }, [teamSize, useCase, toolInputs]);

  // 1b: Smooth-scroll to results when they appear
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const total = useMemo(() => toolInputs.reduce((sum, tool) => sum + Number(tool.monthlySpend || 0), 0), [toolInputs]);

  // 1d: Disable submit when no tools have spend > 0
  const hasSpend = useMemo(() => toolInputs.some((tool) => tool.monthlySpend > 0), [toolInputs]);

  function updateTool(index: number, patch: Partial<ToolInput>) {
    setToolInputs((current) => current.map((tool, i) => (i === index ? { ...tool, ...patch } : tool)));
  }

  // 1a: Error handling on audit submit
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamSize, useCase, tools: toolInputs.filter((tool) => tool.monthlySpend > 0) })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Audit failed (${response.status})`);
      }
      setResult((await response.json()) as AuditResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "grid gap-2 text-sm font-bold text-[#445147]";
  const fieldClass = "min-h-11 w-full rounded-md border border-[#ccd5c7] bg-white px-3 py-2 font-[inherit] text-[#17201b] transition-colors focus:border-[#2f7c57] focus:outline-none focus:ring-1 focus:ring-[#2f7c57]";

  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between border-b border-[#dfe5da] px-[clamp(18px,4vw,56px)] py-[18px]">
        <span className="text-lg font-extrabold text-[#113b28]">StackTrim</span>
        <span>Free AI spend audit</span>
      </nav>

      <section className="grid items-end gap-7 px-[clamp(18px,4vw,56px)] pb-[34px] pt-14 min-[981px]:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="mb-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2f7c57]">Credex-ready audit tool</p>
          <h1 className="m-0 max-w-[1000px] text-[clamp(2.6rem,8vw,6.4rem)] leading-[0.93] tracking-normal">Find wasted AI spend before renewal week.</h1>
          <p className="max-w-[760px] text-lg leading-relaxed text-[#526055]">Enter the AI tools your team pays for. Get a defensible savings audit, a public report URL, and a Credex handoff when the savings are large enough to matter.</p>
        </div>
        <div className="rounded-lg border border-[#dfe5da] bg-white p-[22px]">
          <span>Current stack</span>
          <strong className="mt-2 block text-3xl">${total.toLocaleString()}/mo</strong>
        </div>
      </section>

      <form className="px-[clamp(18px,4vw,56px)] pb-16" onSubmit={submit}>
        <div className="mb-[18px] grid gap-4 min-[981px]:grid-cols-2">
          <label className={labelClass}>
            Team size
            <input className={fieldClass} type="number" min={1} value={teamSize} onChange={(event) => setTeamSize(Number(event.target.value))} />
          </label>
          <label className={labelClass}>
            Primary use case
            <select className={fieldClass} value={useCase} onChange={(event) => setUseCase(event.target.value as UseCase)}>
              {Object.entries(useCaseLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3.5 min-[621px]:grid-cols-2 min-[981px]:grid-cols-4">
          {tools.map((tool, index) => {
            const value = toolInputs[index] ?? defaultTools[index];
            return (
              <fieldset className="m-0 grid gap-3 rounded-lg border border-[#dfe5da] bg-white p-[18px]" key={tool.id}>
                <legend className="px-1.5 text-base font-extrabold">{tool.name}</legend>
                <label className={labelClass}>
                  Plan
                  <select className={fieldClass} value={value.plan} onChange={(event) => updateTool(index, { plan: event.target.value })}>
                    {tool.plans.map((plan) => (
                      <option key={plan.label} value={plan.label}>{plan.label}</option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Seats
                  <input className={fieldClass} type="number" min={1} value={value.seats} onChange={(event) => updateTool(index, { seats: Number(event.target.value) })} />
                </label>
                <label className={labelClass}>
                  Monthly spend
                  <input className={fieldClass} type="number" min={0} step="0.01" value={value.monthlySpend} onChange={(event) => updateTool(index, { monthlySpend: Number(event.target.value) })} />
                </label>
              </fieldset>
            );
          })}
        </div>

        {/* 1a: Inline error message */}
        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <svg className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
            <button type="button" className="ml-auto cursor-pointer border-0 bg-transparent p-0 text-red-500 hover:text-red-700" onClick={() => setError(null)} aria-label="Dismiss error">✕</button>
          </div>
        )}

        {/* 1d: Disable when no spend */}
        <button
          className="mt-5 inline-flex min-h-12 min-w-[220px] cursor-pointer items-center justify-center rounded-md border-0 bg-[#143c2a] px-[18px] text-[1.05rem] font-extrabold text-white transition-all hover:bg-[#1a5038] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#143c2a] disabled:active:scale-100"
          type="submit"
          disabled={loading || !hasSpend}
        >
          {loading ? "Auditing…" : !hasSpend ? "Add spend to at least one tool" : "Audit my AI spend"}
        </button>
      </form>

      {/* 1b: Scroll target ref */}
      <div ref={resultsRef}>
        {result && <Results result={result} />}
      </div>

      {/* 1c: Footer */}
      <footer className="border-t border-[#dfe5da] px-[clamp(18px,4vw,56px)] py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#5b675d]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#113b28]">StackTrim</span>
            <span>·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-[#5b675d] no-underline transition-colors hover:text-[#113b28]">Privacy</a>
            <a href="#" className="text-[#5b675d] no-underline transition-colors hover:text-[#113b28]">Terms</a>
            <a href="https://credex.ai" target="_blank" rel="noreferrer" className="text-[#5b675d] no-underline transition-colors hover:text-[#113b28]">Credex</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
