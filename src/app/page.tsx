"use client";

import { useEffect, useMemo, useState } from "react";
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

  const total = useMemo(() => toolInputs.reduce((sum, tool) => sum + Number(tool.monthlySpend || 0), 0), [toolInputs]);

  function updateTool(index: number, patch: Partial<ToolInput>) {
    setToolInputs((current) => current.map((tool, i) => (i === index ? { ...tool, ...patch } : tool)));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ teamSize, useCase, tools: toolInputs.filter((tool) => tool.monthlySpend > 0) })
    });
    setResult((await response.json()) as AuditResult);
    setLoading(false);
  }

  const labelClass = "grid gap-2 text-sm font-bold text-[#445147]";
  const fieldClass = "min-h-11 w-full rounded-md border border-[#ccd5c7] bg-white px-3 py-2 font-[inherit] text-[#17201b]";

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

        <button className="mt-5 inline-flex min-h-12 min-w-[220px] cursor-pointer items-center justify-center rounded-md border-0 bg-[#143c2a] px-[18px] text-[1.05rem] font-extrabold text-white disabled:cursor-wait disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Auditing..." : "Audit my AI spend"}</button>
      </form>

      {result && <Results result={result} />}
    </main>
  );
}
