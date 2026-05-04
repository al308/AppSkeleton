# Expo App Skeleton

> A skeleton for Expo (React Native + TypeScript) mobile apps, tuned for vibe-coding with Claude Code in VS Code.

A ready-to-go template for new Expo apps. It ships:

- A working **Expo SDK 54** app (`App.tsx` renders "Hello, world", boots on iOS / Android / web).
- A **deterministic guardrail layer** — CI, `pre-commit`, Claude Code hooks. Anything that can't be skipped lives here.
- A **Claude Code advisory layer** — rules, four sub-agents, three slash-skills, two file-protection hooks.
- Two static **documentation web pages** (general info + privacy policy) under [docs/web/](./docs/web/).
- A **PR-based workflow** with the three CI jobs as required status checks.

For the long-form rationale behind every choice, see [GuidelinesAndStructureForApps.md](./GuidelinesAndStructureForApps.md). For the full Spec→Plan→Approve→Implement→Review→Commit workflow, see [.claude/rules/00-workflow.md](./.claude/rules/00-workflow.md).

---

## Use as a template for a new app

This repo's "Template repository" flag is on — click the green **Use this template** button on GitHub. After cloning, change these six identifiers (everything else can stay as-is):

| Where                        | Field                       | Example                                                |
| ---------------------------- | --------------------------- | ------------------------------------------------------ |
| [app.json](app.json)         | `expo.name`                 | `"My Cool App"`                                        |
| [app.json](app.json)         | `expo.slug`                 | `"my-cool-app"`                                        |
| [app.json](app.json)         | `expo.scheme`               | `"mycoolapp"` (deep-link scheme, lowercase, no dashes) |
| [app.json](app.json)         | `expo.ios.bundleIdentifier` | `"com.yourorg.mycoolapp"`                              |
| [app.json](app.json)         | `expo.android.package`      | `"com.yourorg.mycoolapp"`                              |
| [package.json](package.json) | `name`                      | `"my-cool-app"`                                        |

Bundle IDs / package names must be globally unique on the App Store and Play Store — use your own reverse-domain prefix.

Then drop fresh binaries into [assets/](./assets/) (see [assets/README.md](./assets/README.md) for sizes).

---

## Quickstart

```bash
# 0. Use Node 20+. If you have nvm: `nvm use` (reads .nvmrc).
# 1. Install just (optional, recommended): brew install just

just setup            # = npm ci + expo-doctor
just start            # boots the Expo dev server
                      #   then press i (iOS sim), a (Android emu),
                      #   or scan the QR with Expo Go
```

That's it — you should see "Hello, world".

### Optional: local pre-commit gates

```bash
pipx install pre-commit
pre-commit install --hook-type pre-commit --hook-type commit-msg --hook-type pre-push
```

Adds whitespace / YAML / JSON / large-file / private-key checks, gitleaks secret scan, conventional-commit lint, and a full Jest run on push. The Claude Code hook in [.claude/hooks/pre-commit-tests.sh](./.claude/hooks/pre-commit-tests.sh) gates _Claude's_ commits independently, so this is only needed for commits you make yourself in the terminal.

---

## Inventory — what's in the box

### App code

| Path                                       | Purpose                                                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| [App.tsx](./App.tsx)                       | The single "Hello, world" screen. Replace with your real app.                                                           |
| [index.ts](./index.ts)                     | Registers `App` as the root component via `registerRootComponent`. Rarely edited.                                       |
| [app.json](./app.json)                     | Expo config — name, slug, scheme, icons, splash, bundle/package IDs, web bundler. **Edited per-app** (see table above). |
| [babel.config.js](./babel.config.js)       | Babel preset (`babel-preset-expo`).                                                                                     |
| [expo-env.d.ts](./expo-env.d.ts)           | Pulls in Expo's ambient TypeScript types.                                                                               |
| [tests/App.test.tsx](./tests/App.test.tsx) | Smoke test mirroring `App.tsx`. New tests follow the same `tests/<source-path>.test.tsx` mirror.                        |
| [components/](./components/)               | _Empty placeholder._ Drop reusable components here once you have any.                                                   |
| [scripts/](./scripts/)                     | _Empty placeholder._ For one-off dev scripts (data seeders, migrations, etc.).                                          |

### Tooling configuration

| Path                                                               | Purpose                                                                                                                            |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [package.json](./package.json)                                     | npm scripts (`start`/`ios`/`android`/`web`/`lint`/`typecheck`/`test`/`check`), deps, Jest preset.                                  |
| [package-lock.json](./package-lock.json)                           | Locked deps tree. **Never hand-edit** — regenerated by `npm install`.                                                              |
| [tsconfig.json](./tsconfig.json)                                   | `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `noImplicitOverride` + `noFallthroughCasesInSwitch`.        |
| [eslint.config.mjs](./eslint.config.mjs)                           | ESLint 9 flat config — extends `eslint-config-expo` + `eslint-config-prettier`.                                                    |
| [.prettierrc](./.prettierrc), [.prettierignore](./.prettierignore) | Prettier config (single quotes, trailing commas, 100 cols).                                                                        |
| [justfile](./justfile)                                             | Task runner wrapping the npm scripts. `just` = `just check`.                                                                       |
| [.nvmrc](./.nvmrc)                                                 | Pins Node major to 20.                                                                                                             |
| [.gitignore](./.gitignore)                                         | Node, Expo, native projects (`ios/`, `android/`), `.env*` except `.env.example`, Claude local overrides.                           |
| [.env.example](./.env.example)                                     | Template for env vars. Copy to `.env` (gitignored). `EXPO_PUBLIC_*` prefix = inlined into JS bundle = **don't put secrets there**. |
| [.gitleaks.toml](./.gitleaks.toml)                                 | Allowlist / rules for the gitleaks secret scanner.                                                                                 |
| [.pre-commit-config.yaml](./.pre-commit-config.yaml)               | Local git hooks (Python `pre-commit` tool).                                                                                        |

### Documentation

| Path                                                                                       | Purpose                                                                                                                      |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| [README.md](./README.md)                                                                   | This file.                                                                                                                   |
| [CLAUDE.md](./CLAUDE.md)                                                                   | Claude's project system prompt — auto-loaded every VS Code session. Stack, commands, workflow, code style, don't-touch list. |
| [PLAN.md](./PLAN.md)                                                                       | Current feature's execution plan. **Overwritten** when a new feature starts.                                                 |
| [GuidelinesAndStructureForApps.md](./GuidelinesAndStructureForApps.md)                     | Long-form rationale for every choice in this skeleton.                                                                       |
| [LICENSE](./LICENSE), [CHANGELOG.md](./CHANGELOG.md)                                       | Standard.                                                                                                                    |
| [docs/adr/0002-three-layer-guardrails.md](./docs/adr/0002-three-layer-guardrails.md)       | Why the three-layer model (deterministic / advisory / project shape).                                                        |
| [docs/adr/0003-expo-sdk-upgrade-playbook.md](./docs/adr/0003-expo-sdk-upgrade-playbook.md) | SDK bump procedure with the three traps that bite people.                                                                    |
| [docs/specs/expo-skeleton.md](./docs/specs/expo-skeleton.md)                               | The skeleton's own spec. New features go in `docs/specs/<feature>.md` next to it.                                            |
| [docs/web/](./docs/web/)                                                                   | Hand-written static info + privacy pages (HTML + CSS, no build step). Host on GitHub Pages, Vercel, Netlify, or anywhere.    |
| [assets/README.md](./assets/README.md)                                                     | What binary assets the skeleton expects, with recommended sizes.                                                             |

### CI / GitHub

| Path                                                                   | Purpose                                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [.github/workflows/ci.yml](./.github/workflows/ci.yml)                 | Three jobs run on every PR and push to `main`: **quality** (lint + format-check + typecheck + npm audit), **test** (Jest), **secrets** (gitleaks). All three are required status checks via the `main` ruleset. |
| [.github/pull_request_template.md](./.github/pull_request_template.md) | PR scaffold — summary, spec/plan link, verification checklist, risk note.                                                                                                                                       |

### Claude Code plumbing

| Path                                                                           | Purpose                                                                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| [.claude/settings.json](./.claude/settings.json)                               | Permission allow/deny lists + the three hooks below + a `SessionStart` reminder.                                              |
| [.claude/rules/00-workflow.md](./.claude/rules/00-workflow.md)                 | The spec→plan→approve→phased-implement→review→commit cadence.                                                                 |
| [.claude/rules/10-typescript-style.md](./.claude/rules/10-typescript-style.md) | TS / RN style conventions (no `any` across boundaries, function components only, errors not swallowed, etc.).                 |
| [.claude/rules/20-testing.md](./.claude/rules/20-testing.md)                   | Jest + RNTL patterns — accessibility queries first, `setupFilesAfterEnv` rules, no real timers.                               |
| [.claude/rules/30-dont-touch.md](./.claude/rules/30-dont-touch.md)             | Files Claude must propose, not edit (`.env*`, `package-lock.json`, `ios/`, `android/`, …).                                    |
| [.claude/agents/planner.md](./.claude/agents/planner.md)                       | **Sub-agent.** Reads a spec, writes `PLAN.md` with phases + stage gates.                                                      |
| [.claude/agents/reviewer.md](./.claude/agents/reviewer.md)                     | **Sub-agent.** Read-only code review after each phase.                                                                        |
| [.claude/agents/test-runner.md](./.claude/agents/test-runner.md)               | **Sub-agent.** Runs Jest, summarizes failures concisely (no edits).                                                           |
| [.claude/agents/security-reviewer.md](./.claude/agents/security-reviewer.md)   | **Sub-agent.** Hard-coded secret hunt + npm audit + manual review.                                                            |
| [.claude/skills/new-feature/SKILL.md](./.claude/skills/new-feature/SKILL.md)   | **Slash command** `/new-feature <description>` — drives the full workflow.                                                    |
| [.claude/skills/fix-issue/SKILL.md](./.claude/skills/fix-issue/SKILL.md)       | **Slash command** `/fix-issue <ref>` — reproduce-with-failing-test → diagnose → minimal fix.                                  |
| [.claude/skills/full-checks/SKILL.md](./.claude/skills/full-checks/SKILL.md)   | **Slash command** `/full-checks` — runs the local equivalent of CI, reports PASS/FAIL.                                        |
| [.claude/hooks/protect-files.sh](./.claude/hooks/protect-files.sh)             | Blocks Claude's `Edit`/`Write` on `.env`, `.env.*` (except `.env.example`), `.git/`, `package-lock.json`, `ios/`, `android/`. |
| [.claude/hooks/pre-commit-tests.sh](./.claude/hooks/pre-commit-tests.sh)       | Runs lint + format-check + typecheck + Jest before letting Claude execute `git commit`. Aborts the commit on red.             |

---

## What runs when

Three different "checking" mechanisms, three different trigger points. Don't conflate them.

| Trigger                                    | Who checks                                                                     | What                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Claude **edits a file** in VS Code         | `PostToolUse` hook                                                             | Auto-runs `prettier --write` + `eslint --fix` on the changed file. |
| Claude tries to write a **protected file** | `PreToolUse` hook ([protect-files.sh](./.claude/hooks/protect-files.sh))       | Aborts the edit, surfaces the rule.                                |
| Claude runs **`git commit`**               | `PreToolUse` hook ([pre-commit-tests.sh](./.claude/hooks/pre-commit-tests.sh)) | Full check (lint + format + types + jest). Hard gate.              |
| **You** run `git commit` in terminal       | `pre-commit` (Python tool, optional)                                           | Whitespace, YAML/JSON, gitleaks, conventional-commit lint.         |
| **You** run `git push`                     | `pre-commit` `pre-push` stage                                                  | Full Jest run.                                                     |
| Anyone opens a **PR** or pushes to `main`  | GitHub Actions ([ci.yml](./.github/workflows/ci.yml))                          | Three jobs in parallel: `quality`, `test`, `secrets`.              |

**No automatic fixing in CI.** CI is a gate, not a mechanic. Format drift gets fixed locally by the `PostToolUse` hook (when Claude edits) or by `npm run lint:fix && npm run format` (when you do).

### Sub-agents and skills do **not** run in CI

The four sub-agents and three slash-skills under `.claude/` live entirely **inside your VS Code session**. They are invoked by Claude (or by you typing `/<skill>`) during interactive coding. There is no GitHub-side bot in this skeleton — `claude.yml` was deliberately not shipped (see [Guidelines §11](./GuidelinesAndStructureForApps.md) for why and how to add it later).

---

## Building your first feature

End-to-end walkthrough, assuming you've cloned via "Use this template" and run `just setup`.

### 1. Branch

```bash
git switch -c feat/<short-name>
```

Direct pushes to `main` are blocked by the branch ruleset — use a branch + PR.

### 2. Tell Claude what you want

In VS Code with Claude Code open:

```
/new-feature add dark mode toggle to the settings screen
```

This invokes the [new-feature skill](./.claude/skills/new-feature/SKILL.md). Claude will:

1. Interview you with `AskUserQuestion` to pin down constraints, edge cases, scope.
2. Write `docs/specs/dark-mode-toggle.md`.
3. Delegate to the [planner sub-agent](./.claude/agents/planner.md) which writes `PLAN.md` with phases and stage gates.
4. **Stop** and wait for your explicit approval.

### 3. Approve the plan, then phase by phase

After you say "approved", Claude implements **phase 1 only**, then runs `just check`, then waits for you again. Same for phase 2, etc.

Each phase ends with measurable criteria — a test that must pass, a screenshot, a verification command. The pre-commit hook gates every commit Claude makes. You'll never get a commit on a red tree.

### 4. Open the PR

When the last phase is green:

```bash
git push -u origin feat/<short-name>
gh pr create --fill        # uses commit messages as body
```

The [PR template](./.github/pull_request_template.md) prompts for summary, spec link, verification checklist, risk note. CI runs automatically.

### 5. Review and merge

For solo work, "code review" is reading your own diff in the PR view (genuinely useful — different mental mode than the editor). Or run the [reviewer sub-agent](./.claude/agents/reviewer.md) inside VS Code:

```
Use the reviewer subagent on the diff for this PR
```

When CI is green:

```bash
gh pr merge <#> --squash --delete-branch
```

Linear history enforced by the ruleset (squash or rebase only, no merge commits).

### 6. After merge

```bash
git switch main && git pull
```

Repeat. Each feature = one branch = one PR = one squash-merged commit on `main`.

---

## Daily commands

```bash
just                # = just check (lint + types + tests)
just setup          # npm ci + expo-doctor (use after pulling main)
just start          # expo start
just ios            # expo start --ios
just android        # expo start --android
just web            # expo start --web
just check          # lint + types + tests
just lint           # eslint --fix + prettier --write
just types          # tsc --noEmit
just test           # jest
just doctor         # npx expo-doctor
just ci             # exact CI equivalent
just clean          # rm -rf node_modules .expo dist web-build coverage
```

Or use `npm` directly if you don't have `just`: `npm run start`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run check`.

---

## Working with Claude Code

Open the repo in VS Code with the Claude Code extension installed. Claude auto-loads [CLAUDE.md](./CLAUDE.md) and the rule files under [.claude/rules/](./.claude/rules/) on session start.

### Slash commands

| Command                             | What it does                                                   |
| ----------------------------------- | -------------------------------------------------------------- |
| `/new-feature <description>`        | Full spec → plan → phased implement → review → commit workflow |
| `/fix-issue <issue-or-description>` | Reproduce with a failing test, diagnose, fix, regression-test  |
| `/full-checks`                      | Local CI equivalent, returns PASS/FAIL                         |

### Sub-agents (invoked by Claude or by you asking)

| Agent               | When to reach for it                             |
| ------------------- | ------------------------------------------------ |
| `planner`           | Multi-file feature — invoke once spec is written |
| `reviewer`          | End of each phase, before merging                |
| `test-runner`       | Run jest without flooding the main session       |
| `security-reviewer` | Before opening an external-facing PR             |

---

## Required assets

Drop these binaries into [assets/](./assets/) before shipping:

- `icon.png` — 1024×1024 PNG (iOS + general)
- `adaptive-icon.png` — 1024×1024 PNG, transparent bg, content within inner ~66 % circle (Android adaptive foreground)
- `splash.png` — tall PNG, e.g. 1284×2778 on a solid background
- `favicon.png` — 48–192 px PNG (web build)
- `notification-icon.png` _(optional)_ — 96×96 PNG, white-on-transparent silhouette

For the web pages (optional but recommended):

- `docs/web/logo.png` — 256–512 px PNG square (header)
- `docs/web/og-image.png` — 1200×630 PNG (social/share preview)

The skeleton boots without them; only `eas build` will hard-fail.

---

## Philosophy

Three layers, each with a different strength:

1. **Deterministic guarantees** — CI, `pre-commit`, Claude Code hooks. _Cannot be skipped._
2. **Agent guidance** — `CLAUDE.md`, rules, sub-agents, skills. _Advisory, the LLM follows most of the time._
3. **Project shape** — repo layout, `package.json`, `app.json`, file conventions. _Static, discoverable._

Anything you cannot afford to have skipped goes in layer 1 — never `CLAUDE.md` alone. The full argument is in [GuidelinesAndStructureForApps.md](./GuidelinesAndStructureForApps.md) and [docs/adr/0002-three-layer-guardrails.md](./docs/adr/0002-three-layer-guardrails.md).

---

## See also

- [GuidelinesAndStructureForApps.md](./GuidelinesAndStructureForApps.md) — long-form rationale for every choice
- [docs/adr/](./docs/adr/) — architecture decisions
- [.claude/rules/00-workflow.md](./.claude/rules/00-workflow.md) — the cadence in detail
- [docs/specs/expo-skeleton.md](./docs/specs/expo-skeleton.md) — the skeleton's own spec, as an example of what `docs/specs/<feature>.md` looks like

## License

See [LICENSE](./LICENSE).
