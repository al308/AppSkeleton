# Don't touch — propose, don't apply

The following paths must not be edited automatically. Propose changes in chat and wait for approval.

- `.env`, `.env.*` — environment secrets. Use `.env.example` for non-sensitive templates.
- `.git/` — git internals. Never write directly.
- `package-lock.json` — regenerated only via `npm install` and reviewed by a human.
- `package.json` dependency pins — proposing a dependency bump is fine; silently changing one is not.
- `ios/`, `android/` — native projects (only present after `expo prebuild`). Treat as generated and reviewed manually.
- `assets/*.png`, `assets/*.jpg` — binary assets are owned by design; the agent does not regenerate them.
- `.github/workflows/*.yml` — CI changes are reviewed manually.
- `LICENSE`, `CHANGELOG.md` — maintained deliberately, not by the agent.

If a task seems to require editing any of these, stop and surface the proposal. The `.claude/hooks/protect-files.sh` hook enforces this at the tool layer; this rule documents _why_.
