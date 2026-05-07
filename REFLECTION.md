# Reflection

## 1. The hardest bug you hit this week, and how you debugged it

The hardest bug in this build was local test execution. The audit engine tests originally used Node's built-in TypeScript stripping, which worked for the top-level test file but failed on extensionless imports inside the app source. I considered rewriting all imports with `.ts` extensions, but that would make the Next.js source less idiomatic and could create friction with the app bundler. I switched the repo back to `tsx --test`, then found the local sandbox blocked the IPC pipe that `tsx` opens. Running the test command with the appropriate execution permission fixed the local verification path while keeping CI straightforward. The useful debugging move was separating "is the test logic broken?" from "is the runner blocked by the environment?" The audit assertions were fine; the issue was module resolution and sandbox permissions.

## 2. A decision you reversed mid-week, and what made you reverse it

I initially tried to avoid `tsx` and use Node's built-in test runner directly because fewer moving parts usually makes an MVP easier to evaluate. I reversed that after the runner could not resolve the app's extensionless TypeScript imports cleanly. I could have changed source imports to satisfy the test runner, but that would optimize the production code around a local testing convenience. The better decision was to keep app code conventional for Next.js and use a purpose-built TypeScript test runner. That trade-off adds one dev dependency, but it protects the source structure and keeps test files simple.

## 3. What you would build in week 2 if you had it

Week 2 should focus on credibility and distribution. I would add pricing versioning so every audit stores the exact pricing table used, then add a benchmark mode showing AI spend per developer by company size. I would also add a PDF export because finance and founder users often need to forward reports internally. On the growth side, I would build a small anonymized benchmark landing page from completed audits, such as "median AI spend per developer for 10-25 person teams." That gives the public URLs and launch posts more substance than a generic calculator. Finally, I would add a queue-backed email flow so high-savings leads trigger a Credex follow-up task.

## 4. How you used AI tools

I used Codex to scaffold the app, generate the first version of the rule engine, write tests, and draft evaluator-facing documentation. I did not trust AI with pricing facts without official source checks, and I did not use it to invent user interviews or fake devlog history. One specific AI mistake I caught was the temptation to treat the LLM as an audit decision-maker. That would have produced impressive-sounding recommendations but weak financial defensibility. The final design keeps AI in the summary layer only and leaves every savings number in deterministic TypeScript.

## 5. Self-rating

**Discipline:** 7/10 — I kept the MVP focused and resisted fake artifacts, but the real seven-day process still needs actual calendar execution.

**Code quality:** 7/10 — The core rules are typed and tested, though production storage and analytics need more hardening.

**Design sense:** 7/10 — The UI is clear, fast, and screenshot-friendly, but it still needs real visual QA on the deployed URL.

**Problem-solving:** 8/10 — I handled environment issues, test runner constraints, and graceful API fallback without derailing the build.

**Entrepreneurial thinking:** 7/10 — The GTM and economics are concrete, but real interviews are the missing piece that should change the product.
