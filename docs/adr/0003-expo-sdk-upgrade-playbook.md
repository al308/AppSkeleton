# ADR 0003: Expo SDK upgrade playbook

## Status

Accepted — written 2026-05-01 after the SDK 52 → 54 upgrade.

## Context

Bumping the Expo SDK touches a tightly coupled set of versions: `expo`, `react`, `react-native`, every `expo-*` package, and a handful of dev-only packages that aren't managed by `expo install`. Doing this casually leads to long ERESOLVE chains.

This ADR captures the order of operations that actually works, plus the things `npx expo install --fix` does **not** do for you.

## Decision

### Upgrade order

1. Bump `expo` itself: `npx expo install expo@~<NEW>.0.0`.
2. Pull all expo-managed prod deps in line: `npx expo install --fix`.
3. **Manually** bump dev-only packages that `expo install` does not touch:
   - `@types/react` — must match the React major bumped by step 2 _exactly_ (RN 0.81 wants `^19.1.0`, not `^19.0.0`).
   - `react-test-renderer` — pin tracks `react` exactly. If `react` is `19.1.0`, this is `19.1.0`.
   - `@testing-library/react-native` — needs to match React major (v12 = React 18, v13 = React 19).
   - `jest-expo` — same SDK major as `expo`.
   - `eslint-config-expo` — same SDK major (SDK 54 → `~10.0.0`).
   - `babel-preset-expo` — explicit dep since SDK 53; `expo install babel-preset-expo` adds it.
   - `typescript` — Expo's templates ship a current minor; bump conservatively if your code compiles.
4. Wipe `node_modules` and `package-lock.json`, then `npm install`.
5. Run `npx expo-doctor`. Fix anything it flags by adjusting the corresponding version.
6. Run `just check`. If a test setup file fails to load, check whether the testing library deprecated a setup path (e.g. `@testing-library/react-native/extend-expect` is gone in v13 — matchers auto-load on first import).

### What we deliberately don't do

- **No `--legacy-peer-deps` / `--force`.** Hides real version mismatches and produces installs that work on your machine but break in CI.
- **No upgrading dev-deps before `expo install --fix`.** The fix step will silently downgrade them again because it bumps prod deps and triggers a re-resolve.

### What `expo-doctor` cannot check

- Test runner config breakages (e.g. removed setup paths in `@testing-library/*`).
- Dev-only type packages that are out of sync with the React major.
- ESLint config compatibility with the bumped `eslint-config-expo`.

## Consequences

The skeleton's [`CLAUDE.md`](../../CLAUDE.md) "Dependency notes" section points at this ADR, so Claude follows the same order on future bumps. Skeleton consumers cherry-picking SDK upgrades into derived apps can read this once and skip the trial-and-error.

The `GuidelinesAndStructureForApps.md` §17 (the 30-minute bootstrap) was extended with a "Bumping the SDK" subsection mirroring the steps above.
