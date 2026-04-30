# ADR 0002 — Three-layer guardrail model (deterministic / advisory / shape)

- **Status:** Accepted
- **Date:** 2026-04-24

## Context

Agent-assisted coding rots when rules are placed in the wrong layer. Putting "tests must pass" in `CLAUDE.md` alone makes it advisory — the LLM will skip it under pressure. Putting "prefer Google-style docstrings" in a hook makes local dev miserable.

## Decision

Every rule lives in exactly one of three layers:

| Layer         | Mechanism                                         | Strength                  | Examples                                              |
| ------------- | ------------------------------------------------- | ------------------------- | ----------------------------------------------------- |
| Deterministic | CI, `pre-commit`, Claude Code hooks               | Cannot be skipped         | Tests pass, no secrets, no edits to protected files   |
| Advisory      | `CLAUDE.md`, `.claude/rules/`, skills, sub-agents | Followed most of the time | Code style, plan-first workflow, phase definitions    |
| Shape         | Repo skeleton, `pyproject.toml`, `justfile`       | Static, discoverable      | `src/` layout, test layout, where ADRs and specs live |

Anything you cannot afford to have skipped goes in the **Deterministic** layer — never in `CLAUDE.md` alone.

## Consequences

- When adding a new rule, the first question is always: "If the agent skips this, can we live with it?" The answer determines the layer.
- Deterministic layer moves slowly (CI changes are reviewed manually). Advisory layer can iterate quickly.
- The `reviewer` sub-agent checks advisory-layer rules; the pre-commit hook and CI check deterministic-layer rules.
- Anyone reading this repo (human or AI) can classify where a requirement belongs without guessing.
