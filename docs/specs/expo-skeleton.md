# Spec: Expo App Skeleton

## Outcome

Transform this repo from a Python project skeleton into a **skeleton for Expo (React Native + TypeScript) mobile apps**. The skeleton must boot a minimal "Hello, world" app via `npx expo start` and ship two static documentation web pages (general info + privacy policy) under `docs/web/`.

## Scope (in)

- Expo SDK 54 (or latest stable) + React Native + TypeScript, managed workflow.
- File-based routing with `expo-router` (single screen for now).
- One screen rendering "Hello, world".
- Static docs site with two pages: `index.html` (general info) and `privacy.html` (privacy policy), share a `styles.css`. Plain HTML/CSS — no build step.
- Tooling: ESLint + Prettier + TypeScript strict + Jest (`jest-expo` preset). `just` recipes wrap the npm scripts so the existing muscle memory (`just check`, `just lint`, `just test`) keeps working.
- Claude guardrails (`.claude/rules`, hooks, agents, skills) updated for the JS/TS stack but the same spec → plan → approve → implement → review → commit workflow.

## Scope (out)

- Authentication, networking, state management libraries (Redux/Zustand) — kept out of the skeleton on purpose.
- EAS Build / submission config — to be added per-project, not in the skeleton.
- Native modules requiring `expo prebuild`.
- A docs build pipeline (Docusaurus, Astro, etc.). The two web pages are intentionally hand-written HTML so they can be hosted anywhere.

## Constraints

- TypeScript `strict` must pass.
- ESLint + Prettier must pass with zero warnings.
- Jest smoke test must pass on CI.
- The two web pages must render correctly opened directly from the filesystem (no server required).
- No paid services or accounts required to run the skeleton.

## Required assets (provided by the user)

The skeleton ships placeholder paths; the user provides the actual binaries before first build:

| Asset                        | Path                           | Size                            | Purpose                          |
| ---------------------------- | ------------------------------ | ------------------------------- | -------------------------------- |
| App icon                     | `assets/icon.png`              | 1024x1024 PNG                   | iOS + general app icon           |
| Adaptive icon (foreground)   | `assets/adaptive-icon.png`     | 1024x1024 PNG, transparent bg   | Android adaptive icon foreground |
| Splash screen                | `assets/splash.png`            | 1284x2778 PNG (or similar tall) | Launch splash                    |
| Favicon                      | `assets/favicon.png`           | 48x48 PNG                       | Web build favicon                |
| Notification icon (optional) | `assets/notification-icon.png` | 96x96 PNG, white-on-transparent | Push notif tray icon             |
| Web logo                     | `docs/web/logo.png`            | ~512x512 PNG                    | Header on info & privacy pages   |
| OG image (optional)          | `docs/web/og-image.png`        | 1200x630 PNG                    | Social share preview             |

Until the user supplies them, the app boots with the bundled Expo defaults; the web pages render with a CSS-only placeholder mark in place of the logo.

## Verification

- `npm install` succeeds.
- `npx expo start` boots and the app shows "Hello, world" in iOS sim, Android emulator, or Expo Go.
- `npm run lint`, `npm run typecheck`, `npm test` all pass.
- `docs/web/index.html` and `docs/web/privacy.html` open in a browser with logo placeholder, header, body content, and inter-page navigation working.

## Task breakdown

See `PLAN.md` for the phased plan and stage gates.
