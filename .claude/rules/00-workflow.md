# Workflow rules

## Spec → Plan → Approve → Implement → Review → Commit

1. **Spec first.** For any feature larger than a one-line change, write or update a spec at `docs/specs/<feature>.md` _before_ code is touched. If requirements are unclear, use the `AskUserQuestion` tool to interview the user. The spec defines: outcome, scope, constraints, task breakdown, verification criteria.

2. **Plan before code.** Enter Plan Mode (`Shift+Tab`) and produce `PLAN.md` for the current feature. The plan must include proposed structure, phases, and stage gates.

3. **Approval gate.** Never start implementation before the user explicitly approves the plan. If the user only says "looks good", confirm once more before touching code.

4. **Phased execution with stage gates.** The plan splits work into phases. Each phase has explicit **Definition of Done** criteria for both _functionality_ and _tests_. Do not start phase N+1 until phase N's gate passes locally.

5. **Reference patterns, don't invent.** When adding a new module, point to an existing analogue in the codebase and follow its conventions. Do not introduce new frameworks, abstractions, or dependencies without an ADR in `docs/adr/`.

6. **Verification first.** Every task must include how it will be verified (test name, command, screenshot diff, etc.).

7. **Small commits, descriptive messages.** Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`). One logical change per commit.

8. **No suppressing errors.** Fix root causes. Do not silence with `// eslint-disable`, `// @ts-ignore`, `// @ts-expect-error`, empty `catch {}`, or `--no-verify` unless the user explicitly requests it.

9. **Use sub-agents for investigation.** Any task that requires reading more than ~5 files goes to an explorer or planner sub-agent so the main context stays clean.

10. **After each phase, run `just check`.** Never move forward until it's green.
