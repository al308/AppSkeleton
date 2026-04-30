---
name: new-feature
description: Run the full spec → plan → approval → phased implement → review → commit workflow for a new feature.
---

Argument: $ARGUMENTS (the feature description)

Execute these steps strictly in order. Do not skip steps. Do not batch approvals.

1. **Interview.** Use the `AskUserQuestion` tool to clarify this feature. Cover:
   - Technical constraints (runtime, deps, perf)
   - Edge cases and failure modes
   - UX (if any)
   - Tradeoffs made
   - What is explicitly OUT of scope

2. **Spec.** Write `docs/specs/<slug>.md` (slug = kebab-case of `$ARGUMENTS`). Structure:
   - **Outcome** — the one-sentence result
   - **Scope** — what's in, what's out
   - **Constraints** — runtime, latency, memory, compatibility
   - **Prior decisions** — ADRs or code analogues to follow
   - **Task breakdown** — high-level steps
   - **Verification criteria** — how we'll know it works

3. **Plan.** Delegate to the `planner` sub-agent to produce `PLAN.md` from the spec.

4. **Approval gate.** Show me the plan. STOP. Wait for me to explicitly say "approve" or equivalent. Do not write code until then.

5. **Phase loop.** For each phase:
   - Implement only that phase's files.
   - Run `just check` (lint + types + tests).
   - Run the phase's verification command.
   - Report a one-paragraph result.
   - Wait for me to approve before starting the next phase.

6. **Review.** After the final phase, delegate to the `reviewer` sub-agent. Address every finding. Re-run `just check`.

7. **Commit.** Use Conventional Commits. One commit per phase if phases are substantial; one commit for trivial features. Never use `--no-verify`.

8. **PR.** Open a PR whose description summarizes: spec outcome, phases completed, verification evidence.
