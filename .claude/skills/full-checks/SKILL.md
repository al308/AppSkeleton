---
name: full-checks
description: Run all quality gates locally — exactly what CI runs.
---

Run, in order, and stop on the first failure:

1. `npm ci`
2. `npm run lint`
3. `npm run format:check`
4. `npm run typecheck`
5. `npm audit --audit-level=high`
6. `npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'`

Report a single **PASS** / **FAIL** summary. On FAIL, include the failing step's name and its last 20 lines of output. Do not attempt to fix — just report.
