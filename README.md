# Expo App Skeleton

> A skeleton for Expo (React Native + TypeScript) mobile apps, tuned for vibe-coding with Claude Code in VS Code.

A ready-to-go template for new Expo apps. It bundles the deterministic guardrails (CI, `pre-commit`, Claude hooks), the advisory layer ([CLAUDE.md](./CLAUDE.md), rules, sub-agents, skills), and the modern JS/TS tooling stack (`expo` + `eslint` + `prettier` + `typescript` + `jest`).

The repo also ships two static documentation web pages under [docs/web/](./docs/web/): a general info page and a privacy policy template.

See [GuidelinesAndStructureForApps.md](./GuidelinesAndStructureForApps.md) for the full rationale behind every choice.

## Use as a template for a new app

This repo is meant to be a template — set the **"Template repository"** checkbox in the GitHub repo settings, then click "Use this template" for every new app. After cloning, change these five identifiers (everything else can stay as-is):

| Where                        | Field                       | Example                                                |
| ---------------------------- | --------------------------- | ------------------------------------------------------ |
| [app.json](app.json)         | `expo.name`                 | `"My Cool App"`                                        |
| [app.json](app.json)         | `expo.slug`                 | `"my-cool-app"`                                        |
| [app.json](app.json)         | `expo.scheme`               | `"mycoolapp"` (deep-link scheme, lowercase, no dashes) |
| [app.json](app.json)         | `expo.ios.bundleIdentifier` | `"com.yourorg.mycoolapp"`                              |
| [app.json](app.json)         | `expo.android.package`      | `"com.yourorg.mycoolapp"`                              |
| [package.json](package.json) | `name`                      | `"my-cool-app"`                                        |

Bundle identifiers / package names must be globally unique on the App Store and Play Store, so use your own reverse-domain prefix.

Drop fresh assets into [assets/](assets/) (see [assets/README.md](assets/README.md)) and you're ready to go.

## Quickstart

```bash
# 1. Use Node 20+. If you have nvm: `nvm use` (reads .nvmrc).
# 2. Install just (optional): brew install just
# 3. Drop your binary assets into ./assets — see assets/README.md

just setup            # npm ci + expo-doctor
just start            # boot the dev server (i = iOS sim, a = Android emu)
```

For local commit/push gates (optional):

```bash
pipx install pre-commit
pre-commit install --hook-type pre-commit --hook-type commit-msg --hook-type pre-push
```

## Using it

```bash
just             # alias for `just check`
just check       # lint + types + tests
just lint        # eslint --fix + prettier --write
just types       # tsc --noEmit
just test        # jest
just start       # expo start
just ios         # expo start --ios
just android     # expo start --android
just web         # expo start --web
just ci          # CI equivalent locally
```

Or use `npm` directly: `npm run start`, `npm run ios`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run check`.

## With Claude Code

Open the repo in VS Code with the Claude Code extension installed. Claude will automatically load [CLAUDE.md](./CLAUDE.md) and the rule files under [.claude/rules/](./.claude/rules/) on session start.

Common slash commands provided by this skeleton:

- `/new-feature <description>` — spec → plan → phased implement → review → commit
- `/fix-issue <issue>` — reproduce with a failing test, diagnose, fix
- `/full-checks` — run the full local CI equivalent and report PASS/FAIL

Sub-agents available:

- `planner` — turns a spec into `PLAN.md` with phases and stage gates
- `reviewer` — read-only code review at the end of each phase
- `test-runner` — runs jest and reports failures concisely
- `security-reviewer` — dependency audit + manual security review

## Project layout

```
.
├── .claude/             # Claude Code config (hooks, rules, agents, skills)
├── .github/workflows/   # CI (quality + test + secrets)
├── App.tsx              # Hello, world screen
├── index.ts             # Registers the root component
├── app.json             # Expo config (name, icons, splash, bundle id)
├── assets/              # Icon, adaptive-icon, splash, favicon (you provide)
├── components/          # Shared components (placeholder)
├── docs/
│   ├── adr/             # Architecture Decision Records
│   ├── specs/           # One spec per feature, written before code
│   └── web/             # Static info + privacy pages (no build step)
│       ├── index.html
│       ├── privacy.html
│       └── styles.css
├── tests/
│   └── App.test.tsx     # Jest + @testing-library/react-native
├── CLAUDE.md            # Project system prompt for Claude
├── package.json
├── tsconfig.json        # TypeScript strict
├── eslint.config.mjs    # ESLint flat config (extends eslint-config-expo)
└── .prettierrc
```

## Required assets

Drop these binaries into [assets/](./assets/) before running:

- `icon.png` — 1024×1024 PNG (iOS + general)
- `adaptive-icon.png` — 1024×1024 PNG, transparent bg (Android adaptive foreground)
- `splash.png` — tall PNG (e.g. 1284×2778)
- `favicon.png` — 48×48 PNG (web build)
- `notification-icon.png` _(optional)_ — 96×96 PNG, white-on-transparent

Web pages also expect (optional) `docs/web/logo.png` (~512×512) and `docs/web/og-image.png` (1200×630) for social previews.

## Philosophy

Three layers:

1. **Deterministic guarantees** — CI, pre-commit, Claude hooks. Cannot be skipped.
2. **Agent guidance** — `CLAUDE.md`, rules, sub-agents, skills. Advisory.
3. **Project shape** — layout, test layout, `package.json`, `app.json`.

Anything you cannot afford to have skipped goes in layer 1 — never `CLAUDE.md` alone.

## License

See [LICENSE](./LICENSE).
