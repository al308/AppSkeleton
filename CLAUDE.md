# Project: Expo App Skeleton

## Stack

- Expo SDK 54 (React Native + TypeScript), managed workflow
- Lint: ESLint (`eslint-config-expo`) | Format: Prettier | Types: tsc --noEmit (strict) | Tests: Jest via `jest-expo`
- Static docs site: hand-written HTML/CSS under `docs/web/`

## Commands (use these, don't guess)

- Install: `npm install`
- Run app: `npm run start` (Expo dev server)
- iOS sim: `npm run ios`
- Android emu: `npm run android`
- Web build: `npm run web`
- Tests: `npm test`
- Single test: `npm test -- tests/App.test.tsx`
- Lint + format: `npm run lint:fix && npm run format`
- Type check: `npm run typecheck`
- All checks: `just check` (lint + types + tests) — wraps `npm run check`

## Workflow — MUST follow in this order

1. **Spec.** For any change beyond a one-line fix, update or create `docs/specs/<feature>.md` first. Use the `AskUserQuestion` tool to interview me if anything is unclear.
2. **Plan.** Enter Plan Mode and write `PLAN.md` for this feature. The plan MUST contain:
   - Proposed project structure changes (new files, new modules)
   - Phases with explicit **stage gates**. Each phase ends with measurable criteria for _functionality_ and _tests_.
   - Verification command for each phase (`npm test`, screenshot, etc.)
3. **Approval gate.** Wait for me to approve the plan before writing code.
4. **Implement phase by phase.** Do not start phase N+1 until phase N's gate passes locally.
5. **Pre-commit gate.** Before any `git commit`, run `just check`. If anything fails, fix it — never `--no-verify`.
6. **Commit.** Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
7. **PR.** Open a PR with a description summarizing the spec, the phases completed, and the verification evidence.

## Code style

- TypeScript `strict`. No `any` across module boundaries.
- Function components with explicit return types on exports.
- Co-locate styles via `StyleSheet.create` for native; keep web docs in plain HTML/CSS.
- No bare `catch (e) {}`. Catch specific errors; log and re-raise.
- Prefer pure functions. Isolate side effects (network, storage) at the edges.
- New tests live in `tests/` mirroring the app's tree (`App.tsx` → `tests/App.test.tsx`).
- Reuse render helpers/fixtures from `tests/` before creating new ones.

## Investigation

- For any task that needs reading more than ~5 files, **delegate to a sub-agent** (`Use the planner sub-agent to map …`). Keeps the main context clean.

## Don't touch (propose, don't apply)

- `.env*`, `package-lock.json`, dependency version pins in `package.json`, `ios/`, `android/`, `assets/` binaries, anything under `.github/workflows/` (CI is reviewed manually).

## Dependency notes

- `react-test-renderer` is pinned to match `react` exactly (currently `19.1.0`). Always bump them together — a mismatch between the two breaks Jest's renderer with cryptic peer-dep errors.
- When adding a new Expo-managed dependency, use `npx expo install <pkg>` (not `npm install`). It picks the version compatible with the current Expo SDK.
- When upgrading the Expo SDK, run `npx expo install --check` to bring all expo-managed packages in line.

## Imports

@.claude/rules/00-workflow.md
@.claude/rules/10-typescript-style.md
@.claude/rules/20-testing.md
@.claude/rules/30-dont-touch.md
