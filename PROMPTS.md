# Prompts

The audit math is deterministic. The only LLM call is the personalized summary paragraph in `src/lib/summary.ts`.

## Anthropic Summary Prompt

```text
Write a concise, finance-literate AI software spend audit summary in about 100 words.
Use plain English. Mention total monthly savings, annual savings, and the largest concrete recommendation.
Do not invent facts. Do not mention private lead details.

Audit JSON:
{...}
```

The JSON includes total current spend, total monthly savings, total annual savings, verdict, and each recommendation's tool, action, savings, and reason.

## Why This Prompt

The prompt is intentionally narrow. It asks for a summary, not a decision, because the audit must remain explainable and testable. The instruction to avoid private lead details protects the public report flow. The JSON shape keeps the model grounded in values already calculated by the rule engine.

## What Did Not Work

A broader prompt that asked the model to "find optimizations" created vague recommendations and occasionally invented vendor discounts. That is why plan matching, savings calculations, and recommendation logic live in code instead of the prompt.
