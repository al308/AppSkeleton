# Release Runbook — Expo App to App Store + Play Store

> The repeatable path from "app works on my phone" to "live in both stores."
> Distilled from shipping **Lesen & Schreiben** (live) and **Stellarblox** (submit-ready).
> Companion doc: [LESSONS.md](./LESSONS.md) for the *why* behind the non-obvious bits.

The single biggest time sink is **not** the build — it's discovering a store
requirement at submit time that needed 14 days of lead time. Read §3 first.

---

## 0. One-time account setup (do once per developer, not per app)

| Account                  | Cost            | Notes                                                           |
| ------------------------ | --------------- | -------------------------------------------------------------- |
| Apple Developer Program  | $99 / year      | Required to ship to the App Store at all.                      |
| Google Play Console      | $25 one-time    | One account ships unlimited apps.                              |
| Expo / EAS account       | free tier OK    | This is the **owner** that holds your signing credentials.     |

Credentials (Apple signing certs, provisioning profiles, Android keystore) are
generated and stored **by EAS under your account**, not in the repo. See
[LESSONS.md → EAS & credentials](./LESSONS.md#eas--credentials).

---

## 1. Per-app identifiers (set before the first build)

These six live in [app.json](../app.json) / [package.json](../package.json) — see the README table.
Then add the EAS wiring:

```jsonc
// app.json
"owner": "<your-eas-account>",          // e.g. "al3o8" — must match the EAS account
"extra": { "eas": { "projectId": "..." } }  // created by `eas init`
```

```jsonc
// eas.json — keep submit minimal; let EAS resolve credentials from the account
"submit": { "production": {} }
```

> ⚠️ **Do not** hand-fill `appleId` / `ascAppId` / `appleTeamId` placeholders in
> `eas.json`. An empty `submit.production` works and avoids stale-placeholder
> bugs. EAS prompts for / reuses the real values at submit time. See
> [LESSONS.md → EAS & credentials](./LESSONS.md#eas--credentials).

Run once: `eas init` (creates the `projectId`), then `eas build:configure`.

## Store submission toolkit

Reusable kit generalized from a real App Store launch (fill the `TODO(you)` placeholders):

- **[STORE_PLAYBOOK.md](STORE_PLAYBOOK.md)** — hard-won lessons & traps (read this first).
- **[../fastlane/README.md](../fastlane/README.md)** — automate the App Store listing via the ASC API (`fastlane ios metadata`); verify with `fastlane/scripts/asc-status.rb`.
- **[../store-assets/](../store-assets/)** — metadata templates + asset checklist (Play Data Safety, 12-testers × 14-days closed test).
- **[../web/](../web/)** + **[DEPLOY_WEBSITE.md](DEPLOY_WEBSITE.md)** — self-contained marketing + privacy/terms site (deploy before submitting).

The reusable ASC **team key** is at the repo root (`AuthKey_*.p8`, gitignored) with its ids in `fastlane/.env` (gitignored).
