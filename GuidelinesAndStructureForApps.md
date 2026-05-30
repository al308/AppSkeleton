# Vibe Coding Project Skeleton — Setup Guide for Expo Apps with Claude Code (VS Code)

A complete blueprint for spinning up new **Expo (React Native + TypeScript)** mobile apps that pair well with Claude Code as your coding agent. Based on Anthropic's official Claude Code docs (best practices, hooks, memory, sub‑agents) and the modern JS/TS tooling stack as of April 2026.

The skeleton ships a one-screen "Hello, world" Expo app, plus two static documentation pages (general info + privacy) under `docs/web/` that you can host anywhere.

---

## 1. The mental model: where each rule belongs

Your raw list mixes three very different layers. Putting a rule in the wrong layer is the #1 reason "vibe coding" projects rot. Use this taxonomy:

| Layer                        | Mechanism                                                        | Strength                                   | What belongs here                                                                                   |
| ---------------------------- | ---------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Deterministic guarantees** | GitHub Actions CI, `pre-commit`, Claude Code **hooks**           | Cannot be skipped                          | Tests must pass, lint must pass, no secrets, no edits to protected files                            |
| **Agent guidance**           | `CLAUDE.md`, `.claude/rules/`, skills, sub-agents, output styles | Advisory; the LLM follows most of the time | Code style, plan-first workflow, project structure proposal, phase definitions, "don't touch" lists |
| **Project shape**            | The repo skeleton itself, `package.json`, `app.json`, `justfile` | Static, discoverable                       | App entry point, test layout, where ADRs and specs live                                             |

The official guidance is explicit on this split: _"Hooks are deterministic and guarantee the action happens. CLAUDE.md instructions are advisory."_ Anything you cannot afford to have skipped goes in a hook or in CI — never CLAUDE.md alone.

---

## 2. Your list, completed and reorganized

Below is the bullet list you'd typically have for a "vibe coding" setup, expanded for the Expo stack and labeled with the right layer.

### Workflow rules (Agent guidance — go in `CLAUDE.md` or rules)

1. **Spec first.** For any feature larger than a one-line change, write or update a spec at `docs/specs/<feature>.md` _before_ code is touched. Use `AskUserQuestion`-style interview if requirements are unclear.
2. **Plan before code.** Always enter Plan Mode (`Shift+Tab` cycles modes) and produce `PLAN.md` for the current feature before any edits.
3. **Project structure proposal.** Before scaffolding anything new, propose the file/folder layout and wait for approval.
4. **Phased execution with stage gates.** The plan must split work into phases; each phase has explicit Definition of Done criteria for both functionality and tests. Do not start phase N+1 until phase N's gate passes.
5. **Reference patterns, don't invent.** When adding a new module/screen, point to an existing analogue in the codebase and follow its conventions.
6. **Verification first.** Every task must include how it will be verified (test name, command, screenshot diff, etc.).
7. **Small commits, descriptive messages.** Conventional Commits format (`feat:`, `fix:`, `chore:`, …). One logical change per commit.
8. **No suppressing errors.** Fix root causes, don't hide them. No `// @ts-ignore`, no empty `catch {}`, no `eslint-disable` without justification.
9. **Don't-touch list.** `.env*`, `package-lock.json`, dependency pins in `package.json`, `ios/`, `android/`, binary assets — propose, don't auto-edit.
10. **Use sub-agents for investigation.** Anything that requires reading >5 files goes to an explorer sub-agent so the main context stays clean.

### Quality rules (Deterministic — go in CI **and** local `pre-commit` **and** Claude hooks)

11. **Format check** — `prettier --check`
12. **Lint** — `eslint . --max-warnings=0`
13. **Type check** — `tsc --noEmit` with `strict` (+ `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
14. **Unit + component tests** — `jest` via `jest-expo` with coverage gate (e.g., `--coverageThreshold='{"global":{"lines":80}}'`)
15. **Dependency vulnerability scan** — `npm audit --audit-level=high`
16. **Secret scan** — `gitleaks detect` (catches API keys before they hit GitHub)
17. **Lockfile integrity** — CI runs `npm ci` (fails if `package-lock.json` is out of sync)
18. **Trailing whitespace, large files, merge conflicts, EOF** — standard `pre-commit-hooks`
19. **Conventional commit message lint** — `commitizen` or `commitlint`

### Pre-commit gate (Claude-specific hook)

20. **Full check before any `git commit`.** A `PreToolUse` hook on Bash matched to `git commit *` runs lint + format-check + typecheck + jest and aborts the commit (exit 2) on failure. This is your hard guardrail against the agent committing red.
21. **Auto-format on every edit.** `PostToolUse(Edit|Write)` runs `prettier --write` and `eslint --fix` on the changed file so style noise never reaches review.
22. **Block writes to protected paths.** `PreToolUse(Edit|Write)` rejects edits to `.env*`, `.git/`, `package-lock.json`, `ios/`, `android/`.

### CI gates (GitHub Actions)

23. **Branch protection on `main`** — no direct pushes, PR + green CI required.
24. **Required status checks** — every check above must pass.
25. **Auto-cancel stale runs** — `concurrency` group per branch.
26. **Cache `node_modules`** — `actions/setup-node@v4` with `cache: 'npm'`.
27. **Optional: Claude Code Action for PR review** — `@claude` comments trigger automated review or fixes.

### Repo hygiene (Project shape)

28. **`README.md`** with quickstart, run/test commands.
29. **`CHANGELOG.md`** — maintained, ideally `Keep a Changelog` format.
30. **`docs/adr/`** — Architecture Decision Records (one short markdown per decision).
31. **`docs/web/`** — static info + privacy pages, hand-written HTML/CSS so the same files can be hosted on Vercel, Netlify, GitHub Pages, or your own S3 bucket without a build step.
32. **`LICENSE`** — pick one early.
33. **`.env.example`** — never commit `.env`. Remember `EXPO_PUBLIC_*` vars are inlined into the JS bundle.

---

## 3. Recommended tooling stack (April 2026)

| Concern           | Choice                                                             | Why                                                                                               |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Framework         | **Expo SDK 54** (managed workflow)                                 | Removes the ceremony of bare React Native; OTA updates, EAS Build, expo-router available.         |
| Language          | **TypeScript 5.9+** with `strict`                                  | Compile-time guarantees for the parts of an app you can't easily test (props, navigation params). |
| Lint              | **ESLint 9** flat config + `eslint-config-expo`                    | Replaces tslint et al.; flat config is the supported path forward.                                |
| Formatter         | **Prettier 3**                                                     | Plus `eslint-config-prettier` so the two don't fight.                                             |
| Type checker      | **tsc --noEmit**                                                   | Don't roll your own; let the compiler do it.                                                      |
| Test runner       | **Jest** with `jest-expo` preset + `@testing-library/react-native` | Standard. RN Testing Library queries by accessibility role, which doubles as an a11y check.       |
| Dependency audit  | **npm audit**                                                      | Built-in; gate at `--audit-level=high` to avoid noise.                                            |
| Secret scan       | **gitleaks**                                                       | Pre-commit + CI.                                                                                  |
| Pre-commit        | **pre-commit** (Python tool, language-agnostic)                    | One config, runs anything.                                                                        |
| Commit convention | **commitizen**                                                     | Generates changelog + version bumps.                                                              |
| Task runner       | **just**                                                           | One command (`just check`) wraps every npm script for muscle memory.                              |
| Build / submit    | **EAS Build / EAS Submit** _(per-project, not in the skeleton)_    | Native binaries + store submission without a Mac for iOS.                                         |
| CI                | **GitHub Actions**                                                 | Already in the repo.                                                                              |
| Optional AI-in-CI | **Claude Code GitHub Action** + Code Review                        | Lets `@claude` work on issues/PRs from outside the IDE.                                           |

---

## 4. The repo skeleton

```
my-app/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # lint, type-check, test, secrets
│       └── claude.yml             # @claude in PRs/issues (optional)
├── .claude/
│   ├── settings.json              # hooks + permissions (committed)
│   ├── settings.local.json        # personal overrides (gitignored)
│   ├── rules/                     # modular rule files
│   │   ├── 00-workflow.md
│   │   ├── 10-typescript-style.md
│   │   ├── 20-testing.md
│   │   └── 30-dont-touch.md
│   ├── agents/                    # sub-agents
│   │   ├── planner.md
│   │   ├── reviewer.md
│   │   ├── test-runner.md
│   │   └── security-reviewer.md
│   ├── skills/                    # invokable workflows
│   │   ├── new-feature/SKILL.md
│   │   ├── fix-issue/SKILL.md
│   │   └── full-checks/SKILL.md
│   └── hooks/                     # shell scripts called by hooks
│       ├── protect-files.sh
│       └── pre-commit-tests.sh
├── docs/
│   ├── adr/                       # 0001-pick-expo-router.md, …
│   ├── specs/                     # one spec per feature
│   └── web/                       # static info + privacy pages
│       ├── index.html
│       ├── privacy.html
│       └── styles.css
├── assets/                        # icon, adaptive-icon, splash, favicon
│   └── README.md                  # what to drop here, with sizes
├── components/                    # reusable RN components
├── tests/
│   └── App.test.tsx               # mirrors src tree
├── App.tsx                        # the Hello, world screen
├── index.ts                       # registerRootComponent(App)
├── app.json                       # Expo config
├── babel.config.js
├── tsconfig.json
├── eslint.config.mjs              # ESLint flat config
├── .prettierrc                    # + .prettierignore
├── package.json
├── package-lock.json              # generated; never edited by hand
├── CLAUDE.md                      # project memory loaded every session
├── PLAN.md                        # current feature's execution plan
├── README.md
├── CHANGELOG.md
├── LICENSE
├── .pre-commit-config.yaml
├── .gitleaks.toml
├── .gitignore
├── .env.example
└── justfile
```

> Why no `src/`? React Native projects conventionally keep the entry (`App.tsx`, `index.ts`) at the root because Expo's bundler and `expo-router` look there by default. Group code by feature inside `components/` or `features/` once the project grows; resist `src/` until a real reason appears.

---

## 5. `CLAUDE.md` — project system prompt

Keep it short. The official advice: _"For each line, ask: would removing this cause Claude to make mistakes? If not, cut it."_ Put deep domain knowledge in `.claude/rules/` or skills (loaded on demand).

```markdown
# Project: <name>

## Stack

- Expo SDK 54 (React Native + TypeScript), managed workflow
- Lint: ESLint (flat config) | Format: Prettier | Types: tsc --noEmit (strict) | Tests: Jest via jest-expo

## Commands (use these, don't guess)

- Install: `npm install`
- Run app: `npm run start`
- iOS sim: `npm run ios`
- Android emu: `npm run android`
- Tests: `npm test`
- Single test: `npm test -- tests/App.test.tsx`
- Lint + format: `npm run lint:fix && npm run format`
- Type check: `npm run typecheck`
- All checks: `just check` (lint + types + tests)

## Workflow — MUST follow in this order

1. **Spec.** For any change beyond a one-line fix, update or create `docs/specs/<feature>.md` first.
2. **Plan.** Enter Plan Mode and write `PLAN.md` for this feature with phases and stage gates.
3. **Approval gate.** Wait for me to approve the plan before writing code.
4. **Implement phase by phase.** Do not start phase N+1 until phase N's gate passes locally.
5. **Pre-commit gate.** Before any `git commit`, run `just check`. If anything fails, fix it — never `--no-verify`.
6. **Commit.** Use Conventional Commits.
7. **PR.** Summarize spec, phases completed, verification evidence.

## Code style

- TypeScript `strict`. No `any` across module boundaries.
- Function components only; explicit return types on exports.
- Co-locate styles via `StyleSheet.create`.
- No bare `catch (e) {}`. Catch specific errors.

## Don't touch (propose, don't apply)

- `.env*`, `package-lock.json`, dependency pins in `package.json`, `ios/`, `android/`, `assets/` binaries, `.github/workflows/`.

## Imports

@.claude/rules/00-workflow.md
@.claude/rules/10-typescript-style.md
@.claude/rules/20-testing.md
@.claude/rules/30-dont-touch.md
```

> The `@path` syntax pulls additional files into context — useful for keeping `CLAUDE.md` itself short while still being able to factor rules into modules.

---

## 6. `.claude/settings.json` — the deterministic guardrails

```json
{
  "permissions": {
    "allow": [
      "Bash(npm install*)",
      "Bash(npm run *)",
      "Bash(npm test*)",
      "Bash(npm ci*)",
      "Bash(npx expo *)",
      "Bash(npx tsc*)",
      "Bash(git status*)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add *)",
      "Bash(gh pr view*)",
      "Bash(gh issue view*)",
      "Bash(just *)"
    ],
    "deny": [
      "Bash(git push --force*)",
      "Bash(rm -rf *)",
      "Bash(npm uninstall*)",
      "Bash(npm publish*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs -I{} sh -c 'case \"{}\" in *.ts|*.tsx|*.js|*.jsx) npx prettier --write \"{}\" >/dev/null 2>&1 && npx eslint --fix \"{}\" >/dev/null 2>&1 ;; esac'"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh" }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git commit *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/pre-commit-tests.sh"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: spec → plan → phased implement → full check → commit. Never bypass tests.'"
          }
        ]
      }
    ]
  }
}
```

`.claude/hooks/protect-files.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
PROTECTED=( ".env" ".git/" "package-lock.json" "ios/" "android/" )
for p in "${PROTECTED[@]}"; do
  if [[ "$FILE_PATH" == *"$p"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$p'. Propose the change in chat instead." >&2
    exit 2
  fi
done
exit 0
```

`.claude/hooks/pre-commit-tests.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
echo "Running full check before commit..." >&2
if ! npm run lint --silent >/dev/null 2>&1; then
  echo "Lint failed. Fix lint before committing." >&2; exit 2
fi
if ! npm run format:check --silent >/dev/null 2>&1; then
  echo "Format check failed. Run 'npm run format'." >&2; exit 2
fi
if ! npm run typecheck --silent >/dev/null 2>&1; then
  echo "Type check failed." >&2; exit 2
fi
if ! npm test --silent >/dev/null 2>&1; then
  echo "Tests failed. Do not commit red." >&2; exit 2
fi
exit 0
```

Make both executable: `chmod +x .claude/hooks/*.sh`.

> The `if` field on the Bash matcher (Claude Code ≥ 2.1.85) lets you scope the hook to `git commit *` only, so other Bash calls aren't slowed down.

---

## 7. Sub-agents — your specialist team

`.claude/agents/planner.md`:

```markdown
---
name: planner
description: Read-only. Produces an execution plan with phases and stage gates from a spec.
tools: Read, Grep, Glob, WebFetch
model: opus
---

You are a senior tech lead. Given a spec, produce `PLAN.md` with:

1. **Proposed structure** — every new/modified file with one-line purpose.
2. **Phases** — 2–6, ordered by risk (lowest risk first). Each phase has:
   - Goal (one sentence)
   - Files touched
   - Stage-gate criteria:
     - _Functionality:_ observable behavior that must work
     - _Tests:_ exact jest selectors that must pass
     - _Verification command:_ one shell command (e.g. `npm test -- tests/components/Foo.test.tsx`)
3. **Risks & open questions** — surface anything ambiguous; do not silently decide.
4. **Out of scope** — what this plan deliberately does NOT do.

Do not write code. Do not modify files other than `PLAN.md`.
```

`.claude/agents/reviewer.md`:

```markdown
---
name: reviewer
description: Read-only code review. Use after each phase before merging.
tools: Read, Grep, Glob, Bash
model: opus
---

You are a senior reviewer. Given the diff for the current phase:

- Verify each stage-gate criterion in PLAN.md is met (run the verification command).
- Look for: missing edge cases, async race conditions, stale closures in `useEffect` deps,
  `any` leaks, swallowed promise rejections, untyped public APIs, tests that mock the
  component under test, hidden I/O in pure functions, secrets accidentally in `EXPO_PUBLIC_*`.
- Output: PASS / FAIL with bullet list of required changes.
```

`.claude/agents/test-runner.md`:

```markdown
---
name: test-runner
description: Runs the test suite, reports failures concisely. Does NOT edit code.
tools: Bash, Read
---

Run `npm test -- --reporters=default`. For each failure, report:

- Test path::name
- One-line failure reason
- Likely file/line causing it
  Stop after reporting; do not fix.
```

`.claude/agents/security-reviewer.md`:

```markdown
---
name: security-reviewer
description: Read-only security review. Run before opening any external-facing PR.
tools: Read, Grep, Glob, Bash
---

Check for: hard-coded secrets, secrets accidentally in `EXPO_PUBLIC_*` (those are bundled),
insecure transport, unsafe `WebView` config, unvalidated deep-link params, weak crypto,
secrets in logs.
Run `npm audit --audit-level=moderate` and `gitleaks detect --no-git -v`.
Report findings with file:line.
```

> Sub-agents run in _isolated context windows_. They report a summary back, so your main conversation stays uncluttered even if they read 50 files.

---

## 8. `package.json` — single source of npm config

```json
{
  "name": "expo-app-skeleton",
  "version": "0.1.0",
  "private": true,
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "jest --passWithNoTests",
    "check": "npm run lint && npm run typecheck && npm test"
  },
  "dependencies": {
    "expo": "~54.0.0",
    "expo-status-bar": "~3.0.9",
    "expo-system-ui": "~6.0.9",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-safe-area-context": "~5.6.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@testing-library/react-native": "^13.0.0",
    "@types/jest": "^29.5.12",
    "@types/react": "~19.1.0",
    "babel-preset-expo": "~54.0.10",
    "eslint": "^9.0.0",
    "eslint-config-expo": "~10.0.0",
    "eslint-config-prettier": "^10.0.0",
    "jest": "^29.7.0",
    "jest-expo": "~54.0.0",
    "prettier": "^3.3.3",
    "react-test-renderer": "19.1.0",
    "typescript": "~5.9.0"
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))"
    ]
  }
}
```

`tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  },
  "include": ["**/*.ts", "**/*.tsx", "expo-env.d.ts"],
  "exclude": ["node_modules", "babel.config.js", "dist", "web-build"]
}
```

`eslint.config.mjs`:

```js
import expoConfig from 'eslint-config-expo/flat.js';
import prettier from 'eslint-config-prettier';

export default [
  ...expoConfig,
  prettier,
  { ignores: ['node_modules/**', 'dist/**', 'web-build/**', '.expo/**', 'docs/web/**'] },
];
```

---

## 9. `.pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: detect-private-key

  - repo: local
    hooks:
      - id: eslint
        name: eslint
        entry: npm run lint
        language: system
        types_or: [ts, tsx, javascript, jsx]
        pass_filenames: false
      - id: prettier
        name: prettier (check)
        entry: npm run format:check
        language: system
        pass_filenames: false
      - id: tsc
        name: tsc --noEmit
        entry: npm run typecheck
        language: system
        pass_filenames: false
      - id: jest
        name: jest (fast)
        entry: npm test
        language: system
        pass_filenames: false
        stages: [pre-push] # heavy check on push, not every commit

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks:
      - id: gitleaks

  - repo: https://github.com/commitizen-tools/commitizen
    rev: v4.1.0
    hooks:
      - id: commitizen
        stages: [commit-msg]
```

> Putting the full `jest` run on `pre-push` (not `pre-commit`) keeps individual commits fast while still blocking bad pushes. The Claude Code hook in §6 _also_ runs the full suite, so any commit the agent makes is gated regardless.

---

## 10. `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Lint
        run: npm run lint
      - name: Format check
        run: npm run format:check
      - name: Type check
        run: npm run typecheck
      - name: Dependency audit
        run: npm audit --audit-level=high

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Tests with coverage
        run: npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'

  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
```

Then in **Settings → Branches → Branch protection rule** for `main`:

- Require a PR
- Require status checks: `quality`, `test`, `secrets`
- Require linear history
- Require conversation resolution

---

## 11. Optional: Claude Code in CI (deliberately not shipped)

The skeleton **does not** ship `.github/workflows/claude.yml`. This is on purpose, and worth understanding before you bring it back.

The Anthropic GitHub Action lets you mention `@claude` in an issue or PR comment and have Claude open a PR or review one. As of May 2026 it requires either:

- a paid **Anthropic API** key (`ANTHROPIC_API_KEY` repo secret) — usage billed pay-as-you-go via console.anthropic.com, **separate** from any Claude Pro / Max subscription, **or**
- AWS Bedrock / Google Vertex / Microsoft Foundry credentials, billed via that provider.

There is currently no OAuth path that reuses a Claude Pro / Max subscription — that was removed in 2025. So if you're a Pro/Max subscriber and you wire up the action with an `ANTHROPIC_API_KEY`, every `@claude` mention in CI burns separate API credits even though you're "already paying Anthropic".

**Recommendation for solo / small teams:** stay in VS Code, talk to Claude there, let CI just gate (`quality` / `test` / `secrets`). Skip this workflow.

**Recommendation when it becomes worth it:** you have multiple humans or you want async PR triage from your phone. Then:

1. Buy API credits at [console.anthropic.com](https://console.anthropic.com).
2. Set `ANTHROPIC_API_KEY` as a repo secret.
3. Add `.github/workflows/claude.yml`. Reference template:

```yaml
name: Claude

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  pull_request_review:
    types: [submitted]
  issues:
    types: [opened, assigned]

jobs:
  claude:
    # Only the repo owner can trigger — prevents drive-by credit burn on public repos.
    # Add 'MEMBER' / 'COLLABORATOR' to the comparison if you want collaborators in.
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude') && github.event.comment.author_association == 'OWNER') ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude') && github.event.comment.author_association == 'OWNER') ||
      (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@claude') && github.event.review.author_association == 'OWNER') ||
      (github.event_name == 'issues' && (contains(github.event.issue.body, '@claude') || contains(github.event.issue.title, '@claude')) && github.event.issue.author_association == 'OWNER')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

The action reads your repo's `CLAUDE.md`, so the same workflow rules apply in CI.

---

## 12. Skills — invokable workflows

`.claude/skills/new-feature/SKILL.md`:

```markdown
---
name: new-feature
description: Run the full spec → plan → approval → implement workflow for a new feature.
---

Argument: $ARGUMENTS (the feature description)

1. Use the `AskUserQuestion` tool to interview me. Cover: technical constraints,
   edge cases, UX, tradeoffs, what is OUT of scope.
2. Write `docs/specs/$(slugify "$ARGUMENTS").md` with: outcomes, scope boundaries,
   constraints, prior decisions, task breakdown, verification criteria.
3. Delegate to the `planner` sub-agent to produce `PLAN.md`.
4. Show me the plan and STOP. Wait for explicit approval.
5. After approval, implement phase 1 only. Run `just check`. Report results.
6. Wait for approval before phase 2. Repeat until done.
7. After the final phase, delegate to the `reviewer` sub-agent.
8. Address review findings. Then commit with Conventional Commits and open a PR.
```

`.claude/skills/full-checks/SKILL.md`:

```markdown
---
name: full-checks
description: Run all quality gates locally — exactly what CI runs.
---

Run, in order, and stop on first failure:

1. `npm ci`
2. `npm run lint`
3. `npm run format:check`
4. `npm run typecheck`
5. `npm audit --audit-level=high`
6. `npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'`

Report a single PASS/FAIL summary with the failing step's output.
```

Invoke from chat: `/new-feature add Google sign-in` or `/full-checks`.

---

## 13. `justfile` (or Makefile equivalent)

```just
default: check

install:
    npm install

check: lint types test

lint:
    npm run lint:fix
    npm run format

lint-ci:
    npm run lint
    npm run format:check

types:
    npm run typecheck

test:
    npm test

start:
    npm run start

ios:
    npm run ios

android:
    npm run android

web:
    npm run web

ci: lint-ci types test

clean:
    rm -rf node_modules .expo dist web-build coverage
```

Now `just` and `just check` work both for you and for Claude.

---

## 14. The phased workflow, in practice

For each new feature you ask Claude to build:

```
[You]    /new-feature add password reset by email
[Claude] (interviews via AskUserQuestion, writes docs/specs/password-reset.md)
[Claude] (delegates to planner sub-agent → writes PLAN.md)
         PLAN.md contains:
           Phase 1 — Reset request screen
             Gate: tests/screens/PasswordResetRequest.test.tsx passes; submit disabled until email valid
           Phase 2 — API client
             Gate: tests/api/passwordReset.test.ts passes; mocks at fetch boundary only
           Phase 3 — Token verify screen + deep link
             Gate: integration test for /reset?token=… deep-link parsing; invalid token shows error
           Phase 4 — Set new password screen
             Gate: end-to-end snapshot of success path; form validation tests
[You]    Approve.
[Claude] (implements Phase 1, runs `just check`, reports green)
[You]    Approve Phase 2.
...
[Claude] (runs reviewer sub-agent, fixes findings, commits feat: …, opens PR)
[CI]     Quality + tests + secrets pass → mergeable.
```

The phased gate structure means **failures are localized**. If Phase 3 breaks, you don't have a 2,000-line PR to debug — Phases 1 and 2 are already verified.

---

## 15. The static `docs/web/` pages

App-store listings link to a public marketing/info page and a privacy policy URL. The skeleton ships both as plain HTML so they can be hosted anywhere and version-controlled with the app.

- `docs/web/index.html` — overview, download links, support email, footer.
- `docs/web/privacy.html` — table of contents + sections (Data we collect / How we use it / Sharing / Retention / Your rights / Children's privacy / Changes / Contact). The TODO blocks are intentional; fill them in before submission.
- `docs/web/styles.css` — shared, light/dark via `prefers-color-scheme`, no fonts loaded from third parties (faster + privacy-clean).

Keep them updated alongside features that change data handling. A common pattern: when a feature introduces a new third-party SDK (analytics, push, payments), the spec must include a checkbox for "update privacy.html" before the phase gate passes.

Hosting options that need no build step: GitHub Pages from `docs/web/` directly, Vercel/Netlify static deploy, or a single-page S3 bucket fronted by CloudFront.

---

## 16. Tips specific to Claude Code in the VS Code extension

- **`/init`** generates a starting `CLAUDE.md` tailored to the codebase. Run it once per new repo, then refine.
- **Plan Mode** — `Shift+Tab` to cycle. Use it for anything multi-file. `Ctrl+G` opens the plan in the editor for direct edits before Claude executes.
- **Checkpoints** — `Esc Esc` (or `/rewind`) restores conversation, code, or both. Lets you experiment without committing — but checkpoints don't track external file changes, so they aren't a substitute for git.
- **`/clear` between unrelated tasks.** Long sessions degrade. Bias toward fresh sessions per feature.
- **`#` in the prompt** writes a one-line note straight into `CLAUDE.md` — fastest way to capture a learned rule without breaking flow.
- **Parallel sessions / worktrees** — for feature B while A is in review, open a second VS Code window on a worktree (`git worktree add ../app-feature-b feature-b`) and run a separate Claude session. They won't fight over the same files.
- **Status line** — install a custom status line that shows context-window usage. Once you can _see_ the budget, you'll start `/clear`-ing at the right moments.
- **Permission allowlists** — every time you click "Allow" for an `npm test` variant, add the pattern to `.claude/settings.json` `permissions.allow`. After a week the prompts disappear.
- **Headless mode for CI loops** — `claude -p "fix all lint errors" --permission-mode auto` from a script can chew through a backlog while you do something else.

### Expo-specific quality-of-life

- **Run on a real device** with `npx expo start --tunnel` — Claude can suggest fixes while you reproduce a bug live.
- **`expo-doctor`** — `npx expo-doctor` audits your install (mismatched RN/Expo SDK pairs, native modules that need prebuild). Worth running in CI as a pre-test step once your dependency surface grows.
- **Screenshot diffs** — for visual regressions, drop a `tests/__image_snapshots__/` directory and use `jest-image-snapshot`. Useful gate when refactoring layout.

---

## 17. The 30-minute bootstrap for any new app

```bash
# 1. Create from this template repo (recommended)
gh repo create my-app --template <your-username>/AppSkeleton --private
cd my-app

# OR scaffold from scratch with create-expo-app and graft the .claude/ stuff on top:
# npx create-expo-app@latest my-app --template blank-typescript

# 2. Install
npm install

# 3. Drop the binary assets into ./assets/
#    (icon.png, adaptive-icon.png, splash.png, favicon.png — see assets/README.md)

# 4. Pre-commit (requires `pre-commit` — `pipx install pre-commit`)
pre-commit install
pre-commit install --hook-type commit-msg
pre-commit install --hook-type pre-push

# 5. Sanity check
just check

# 6. Boot the app
npm run start
# press i (iOS sim), a (Android emu), or scan with Expo Go

# 7. Open in VS Code with Claude Code extension
code .
# Then in Claude: /init  (refine the auto-generated CLAUDE.md against your draft)
```

Turn the whole thing into a **template repo** on GitHub. Future apps: "Use template" → done in 30 seconds.

### Bumping the Expo SDK

`npx expo install --fix` only manages **prod** Expo deps. Dev-only packages drift silently if you don't touch them. The order that actually works (captured in [ADR 0003](docs/adr/0003-expo-sdk-upgrade-playbook.md)):

```bash
# 1. Bump expo itself
npx expo install expo@~<NEW>.0.0

# 2. Pull all expo-managed prod deps in line
npx expo install --fix

# 3. Manually bump dev-deps that step 2 won't touch:
#    - @types/react        → must match React major exactly
#    - react-test-renderer → pin tracks `react`
#    - @testing-library/react-native → v12=React 18, v13=React 19
#    - jest-expo, eslint-config-expo, babel-preset-expo → match SDK major
#    - typescript          → bump conservatively

# 4. Wipe and reinstall (deterministic)
rm -rf node_modules package-lock.json
npm install

# 5. Verify
npx expo-doctor
just check
```

**Don't reach for `--legacy-peer-deps` / `--force`.** Hides real version mismatches. Always fix the underlying pin.

**Watch for testing-library breakage.** v12 → v13 dropped the `extend-expect` setup path; matchers now auto-load. If `setupFilesAfterEnv` complains about a missing module after the bump, just delete that array entry from `package.json`.

### Known transitive vulnerabilities

`npm audit` typically reports a handful of low/moderate findings inside Expo's own dependency tree (`@expo/cli`, `expo-asset`, etc.). These cannot be fixed locally — `npm audit fix` does nothing because the constraint comes from `expo` itself. The CI gate is intentionally `--audit-level=high`, so they don't block. Track Expo's release notes; usually one or two SDK minors clear them.

---

## 18. Shipping — release runbook & lessons learned

Everything above gets you to a working, well-guarded app. Two docs cover the
last mile — getting it into the stores and not relearning the same lessons each
time:

- **[docs/RELEASE.md](./docs/RELEASE.md)** — the repeatable App Store + Play Store
  submission runbook: account setup, the EAS credential model (keep
  `submit.production` empty — credentials live in your EAS account, not the
  repo), the pre-flight checklist, store-asset requirements, and the
  **14-day / 12-tester Google Play closed-test gate** that is the Android
  critical path. Read it *before* the first production build.
- **[docs/LESSONS.md](./docs/LESSONS.md)** — cross-app hard-won knowledge: EAS
  credentials, store-copy validation, feature-flag discipline, low-latency audio
  (`expo-av` + `MixWithOthers`, lazy LRU sound cache), and doc hygiene
  (one STATUS doc, verified against code each session). Append to it as every new
  app teaches you something — that's what makes app N+1 cheaper than app N.

---

## 19. Summary — where each rule lives

| Rule                       |     CLAUDE.md      | `.claude/rules` |        Sub-agent         |       Skill        |              Hook               |   pre-commit    |              CI              |
| -------------------------- | :----------------: | :-------------: | :----------------------: | :----------------: | :-----------------------------: | :-------------: | :--------------------------: |
| Spec before code           |         ✅         |                 |                          | ✅ (`new-feature`) |                                 |                 |                              |
| Plan before code           |         ✅         |                 |      ✅ (`planner`)      |         ✅         |                                 |                 |                              |
| Project structure proposal |         ✅         |                 |      ✅ (`planner`)      |                    |                                 |                 |                              |
| Phases with stage gates    |         ✅         |                 |      ✅ (`planner`)      |                    |                                 |                 |                              |
| Pre-commit full check      |         ✅         |                 |                          | ✅ (`full-checks`) | ✅ (PreToolUse on `git commit`) |  ✅ (pre-push)  |              ✅              |
| Lint / format              |                    |       ✅        |                          |                    |        ✅ (PostToolUse)         |       ✅        |              ✅              |
| Type check                 |                    |       ✅        |                          |                    |                                 |       ✅        |              ✅              |
| Security review            |                    |                 | ✅ (`security-reviewer`) |                    |                                 |                 |              ✅              |
| Dep audit / secret scan    |                    |                 |                          |                    |                                 |  ✅ (gitleaks)  |              ✅              |
| Don't-touch list           |         ✅         |       ✅        |                          |                    |      ✅ (PreToolUse Edit)       |                 |                              |
| Conventional commits       |         ✅         |                 |                          |                    |                                 | ✅ (commitizen) |                              |
| Branch protection          |                    |                 |                          |                    |                                 |                 |              ✅              |
| Privacy page kept current  | ✅ (workflow rule) |       ✅        |                          |                    |                                 |                 |      ✅ (manual review)      |
| Code review                |                    |                 |     ✅ (`reviewer`)      |                    |                                 |                 | ✅ (Claude Action, optional) |

If a rule appears in the **Hook** or **CI** column, that's where the _guarantee_ lives. Everything else is the agent doing its best — which is most of the time, but not always. Build the deterministic layer first; tune the advisory layer second.
