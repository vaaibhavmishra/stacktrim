"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/types";

export function Results({ result, publicView = false }: { result: AuditResult; publicView?: boolean }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sent, setSent] = useState(false);

  async function captureLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result.id) return;
    const form = new FormData(event.currentTarget);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        auditId: result.id,
        email,
        company,
        role,
        teamSize: result.input.teamSize,
        website: form.get("website")
      })
    });
    setSent(true);
  }

  const shareUrl = result.id && typeof window !== "undefined" ? `${window.location.origin}/audit/${result.id}` : "";
  const heroClass = result.verdict === "optimized" ? "bg-[#35413a]" : "bg-[#183f2d]";
  const inputClass = "min-h-11 w-full rounded-md border border-[#ccd5c7] bg-white px-3 py-2 font-[inherit] text-[#17201b]";
  const buttonClass = "inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-md border-0 bg-[#143c2a] px-[18px] font-extrabold text-white no-underline disabled:cursor-wait disabled:opacity-60";

  return (
    <section className="px-[clamp(18px,4vw,56px)] pb-16">
      <div className={`mt-[38px] grid items-center gap-6 p-[clamp(26px,5vw,54px)] text-white min-[981px]:grid-cols-[minmax(0,1fr)_260px] ${heroClass}`}>
        <div>
          <p className="mb-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2f7c57]">AI spend audit</p>
          <h1 className="m-0 text-[clamp(2.4rem,7vw,5.4rem)] leading-[0.95] tracking-normal">${result.totalMonthlySavings.toLocaleString()} monthly savings</h1>
          <p className="text-[1.35rem] font-extrabold text-[#dce9d8]">${result.totalAnnualSavings.toLocaleString()} annualized</p>
        </div>
        <div className="rounded-lg border border-[#dfe5da] bg-white p-[22px] text-[#17201b]">
          <span>Current</span>
          <strong className="mt-2 block text-3xl">${result.totalCurrentSpend.toLocaleString()}/mo</strong>
          <span>Recommended</span>
          <strong className="mt-2 block text-3xl">${result.totalRecommendedSpend.toLocaleString()}/mo</strong>
        </div>
      </div>

      <p className="max-w-[980px] text-xl leading-[1.65] text-[#344238]">{result.summary}</p>

      {result.verdict === "high-savings" ? (
        <div className="my-[22px] flex items-center justify-between gap-[22px] rounded-lg border border-[#cfe1c8] bg-[#eaf4e6] p-[22px] max-[620px]:items-stretch max-[620px]:flex-col">
          <div>
            <strong>Credex can help capture this.</strong>
            <p>At this savings level, procurement credits, plan consolidation, and vendor negotiation can turn the audit into real cash impact.</p>
          </div>
          <a className={buttonClass} href="https://credex.ai" target="_blank" rel="noreferrer">Book Credex consultation</a>
        </div>
      ) : result.verdict === "optimized" ? (
        <div className="my-[22px] flex items-center justify-between gap-[22px] rounded-lg border border-[#cfe1c8] bg-[#eef1ed] p-[22px] max-[620px]:items-stretch max-[620px]:flex-col">
          <strong>You are spending well.</strong>
          <p>There is no need to manufacture a scary number. Leave your email and we will notify you when a new vendor change affects your stack.</p>
        </div>
      ) : null}

      <div className="mt-[18px] grid gap-2.5">
        {result.recommendations.map((item) => (
          <article className="grid items-center gap-4 rounded-lg border border-[#dfe5da] bg-white p-[18px] min-[981px]:grid-cols-[220px_minmax(0,1fr)_120px]" key={`${item.toolId}-${item.currentPlan}`}>
            <div>
              <p className="m-0 mb-1 font-extrabold">{item.toolName}</p>
              <span className="leading-snug text-[#5b675d]">{item.currentPlan}: ${item.currentSpend.toLocaleString()}/mo</span>
            </div>
            <div>
              <p className="m-0 mb-1 font-extrabold">{item.recommendedAction}</p>
              <span className="leading-snug text-[#5b675d]">{item.reason}</span>
            </div>
            <strong className="text-left text-lg text-[#176b45] min-[981px]:text-right">${item.monthlySavings.toLocaleString()}/mo</strong>
          </article>
        ))}
      </div>

      {!publicView && (
        <div className="mt-6 grid gap-4 min-[981px]:grid-cols-2">
          <form className="grid gap-3 rounded-lg border border-[#dfe5da] bg-white p-[22px]" onSubmit={captureLead}>
            <h2 className="m-0">Capture this report</h2>
            <input className={inputClass} type="email" placeholder="Work email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <input className={inputClass} placeholder="Company name (optional)" value={company} onChange={(event) => setCompany(event.target.value)} />
            <input className={inputClass} placeholder="Role (optional)" value={role} onChange={(event) => setRole(event.target.value)} />
            <input className="absolute left-[-9999px]" name="website" tabIndex={-1} autoComplete="off" />
            <button className={buttonClass} type="submit">{sent ? "Report captured" : "Email me the report"}</button>
          </form>
          <div className="rounded-lg border border-[#dfe5da] bg-white p-[22px]">
            <h2 className="m-0">Shareable URL</h2>
            <p className="text-[#536057] [overflow-wrap:anywhere]">{shareUrl || "Saving public URL..."}</p>
            <button className={buttonClass} type="button" onClick={() => shareUrl && navigator.clipboard.writeText(shareUrl)}>Copy public link</button>
          </div>
        </div>
      )}
    </section>
  );
}
