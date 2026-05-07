# Tests

Run:

```bash
npm test
```

Automated tests:

- `tests/audit.test.ts` — downgrades Cursor Business for a two-user team to Pro.
- `tests/audit.test.ts` — downgrades GitHub Copilot Enterprise to Business for a smaller team.
- `tests/audit.test.ts` — handles Claude Team's five-seat minimum when recommending Pro.
- `tests/audit.test.ts` — flags Gemini Ultra as overkill for mixed workflows.
- `tests/audit.test.ts` — returns an honest optimized verdict when no defensible savings exist.
- `tests/audit.test.ts` — marks audits with more than $500/month savings as high-savings.

The CI workflow in `.github/workflows/ci.yml` runs `npm run lint` and `npm test` on pushes to `main` and pull requests.
