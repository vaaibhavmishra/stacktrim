"use client";

import { useEffect, useRef } from "react";
import { useAuditForm } from "../hooks/useAuditForm";
import { tools, useCaseLabels } from "../lib/pricing";
import { Nav } from "./components/nav";
import { Results } from "./components/results";

export default function Home() {
  const {
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
  } = useAuditForm();

  const resultsRef = useRef<HTMLDivElement>(null);

  // Smooth-scroll to results when they appear
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const labelClass =
    "grid gap-2 text-sm font-bold text-[var(--color-text-label)]";
  const fieldClass =
    "min-h-11 w-full rounded-md border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 font-[inherit] text-[var(--color-text-primary)] transition-colors focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="grid items-end gap-7 px-[clamp(18px,4vw,56px)] pb-[34px] pt-14 min-[981px]:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="mb-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-(--color-accent)">
            Credex-ready audit tool
          </p>
          <h1 className="m-0 max-w-[1000px] text-[clamp(2.6rem,8vw,6.4rem)] leading-[0.93] tracking-normal">
            Find wasted AI spend before renewal week.
          </h1>
          <p className="max-w-[760px] text-lg leading-relaxed text-(--color-text-secondary)">
            Enter the AI tools your team pays for. Get a defensible savings
            audit, a public report URL, and a Credex handoff when the savings
            are large enough to matter.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-[22px]">
          <span>Current stack</span>
          <strong className="mt-2 block text-3xl">
            ${total.toLocaleString()}/mo
          </strong>
        </div>
      </section>

      <form className="px-[clamp(18px,4vw,56px)] pb-16" onSubmit={submit}>
        <div className="mb-[18px] grid gap-4 min-[981px]:grid-cols-2">
          <label className={labelClass}>
            Team size
            <input
              className={fieldClass}
              type="number"
              min={1}
              value={teamSize}
              onChange={(event) => setTeamSize(Number(event.target.value))}
            />
          </label>
          <label className={labelClass}>
            Primary use case
            <select
              className={fieldClass}
              value={useCase}
              onChange={(event) =>
                setUseCase(event.target.value as typeof useCase)
              }
            >
              {Object.entries(useCaseLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3.5 min-[621px]:grid-cols-2 min-[981px]:grid-cols-4">
          {tools.map((tool, index) => {
            const value = toolInputs[index];
            return (
              <fieldset
                className="m-0 grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]"
                key={tool.id}
              >
                <legend className="px-1.5 text-base font-extrabold">
                  {tool.name}
                </legend>
                <label className={labelClass}>
                  Plan
                  <select
                    className={fieldClass}
                    value={value?.plan}
                    onChange={(event) =>
                      updateTool(index, { plan: event.target.value })
                    }
                  >
                    {tool.plans.map((plan) => (
                      <option key={plan.label} value={plan.label}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Seats
                  <input
                    className={fieldClass}
                    type="number"
                    min={1}
                    value={value?.seats}
                    onChange={(event) =>
                      updateTool(index, { seats: Number(event.target.value) })
                    }
                  />
                </label>
                <label className={labelClass}>
                  Monthly spend
                  <input
                    className={fieldClass}
                    type="number"
                    min={0}
                    step="0.01"
                    value={value?.monthlySpend}
                    onChange={(event) =>
                      updateTool(index, {
                        monthlySpend: Number(event.target.value),
                      })
                    }
                  />
                </label>
              </fieldset>
            );
          })}
        </div>

        {/* Inline error message */}
        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <svg
              className="h-5 w-5 shrink-0 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              role="img"
              aria-label="Error"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
            <button
              type="button"
              className="ml-auto cursor-pointer border-0 bg-transparent p-0 text-red-500 hover:text-red-700"
              onClick={dismissError}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <button
          className="mt-5 inline-flex min-h-12 min-w-[220px] cursor-pointer items-center justify-center rounded-md border-0 bg-[var(--color-brand)] px-[18px] text-[1.05rem] font-extrabold text-white transition-all hover:bg-[var(--color-brand-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--color-brand)] disabled:active:scale-100"
          type="submit"
          disabled={loading || !hasSpend}
        >
          {loading
            ? "Auditing…"
            : !hasSpend
              ? "Add spend to at least one tool"
              : "Audit my AI spend"}
        </button>
      </form>

      {/* Scroll target ref */}
      <div ref={resultsRef}>{result && <Results result={result} />}</div>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-[clamp(18px,4vw,56px)] py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[var(--color-brand-dark)]">
              StackTrim
            </span>
            <span>·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="text-[var(--color-text-muted)] no-underline transition-colors hover:text-[var(--color-brand-dark)]"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-[var(--color-text-muted)] no-underline transition-colors hover:text-[var(--color-brand-dark)]"
            >
              Terms
            </a>
            <a
              href="https://credex.ai"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-text-muted)] no-underline transition-colors hover:text-[var(--color-brand-dark)]"
            >
              Credex
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
