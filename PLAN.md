# PLAN — Expo App Skeleton

Spec: [docs/specs/expo-skeleton.md](docs/specs/expo-skeleton.md)

## Proposed structure

```
.
├── .claude/                  # rules + agents + hooks updated for JS/TS
├── .github/workflows/        # CI (ts-check, lint, test) — to be revised in a follow-up PR
├── app/                      # expo-router screens
│   ├── _layout.tsx
│   └── index.tsx             # Hello, world
├── assets/                   # icon, adaptive-icon, splash, favicon (user-provided)
├── components/               # shared components (empty placeholder)
├── docs/
│   ├── adr/
│   ├── specs/
│   └── web/                  # static info + privacy pages
│       ├── index.html
│       ├── privacy.html
│       └── styles.css
├── tests/
│   └── App.test.tsx          # jest-expo smoke test
├── app.json                  # Expo config
├── babel.config.js
├── tsconfig.json
├── package.json
├── justfile                  # wraps npm scripts
└── README.md
```

Removed: `pyproject.toml`, `src/myproject/`, Python tests under `tests/unit` & `tests/integration`, `tests/conftest.py`, `.python-version`. The `.pre-commit-config.yaml` is rewritten for JS/TS hooks.

## Phases & stage gates

### Phase 1 — Expo scaffold boots Hello World

**Functionality:** Expo project files in place; `app/index.tsx` renders "Hello, world".
**Tests:** `tests/App.test.tsx` mounts the index screen and asserts the text "Hello, world" is present.
**Verify:**

- `npm install`
- `npm run typecheck` ✓
- `npm run lint` ✓
- `npm test` ✓
- `npx expo start` (manual: open in Expo Go / sim, see "Hello, world")

### Phase 2 — Docs web pages

**Functionality:** `docs/web/index.html` and `docs/web/privacy.html` render standalone with shared `styles.css`. Cross-links work. Privacy page contains placeholder sections (Data we collect, How we use it, Contact).
**Tests:** N/A (static HTML). Manual smoke check.
**Verify:** Open both files in a browser. Click "Privacy" / "Home" links. Confirm logo placeholder appears top-left.

### Phase 3 — Adjust existing skeleton plumbing

**Functionality:**

- `CLAUDE.md` rewritten for the JS/TS stack (commands, layout, workflow unchanged).
- `.claude/rules/10-python-style.md` → `10-typescript-style.md` (similar spirit).
- `.claude/rules/20-testing.md` updated for Jest.
- `.claude/rules/30-dont-touch.md` updated (drop `uv.lock`, add `package-lock.json`/`ios/`/`android/`).
- `justfile` recipes wrap `npm` scripts.
- `.gitignore` extended for `node_modules/`, `.expo/`, `dist/`, `web-build/`, `ios/`, `android/`.
- `.env.example` updated for typical Expo env vars (`EXPO_PUBLIC_*`).
- `.pre-commit-config.yaml` rewritten to run ESLint + Prettier + tsc on staged files.
- `README.md` rewritten as Expo skeleton overview.

**Tests:** `just check` runs the JS/TS pipeline end-to-end.
**Verify:** `just check` is green after `npm install`.

### Phase 4 — Provide asset list to user

**Functionality:** A clear list (in chat) of every binary asset the user needs to drop in, with target path, size, and purpose. Until provided, the skeleton boots with Expo defaults.

## Approval gate

This plan is being executed eagerly per the user's instruction ("get started already, prepare everything"). The user can interrupt and request changes at any phase.
