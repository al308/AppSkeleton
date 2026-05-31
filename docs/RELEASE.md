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

---

## 2. Pre-flight checklist (gate before any production build)

- [ ] `just check` / `npm run type-check` **green** — a single TS error blocks the build.
- [ ] `npm run lint` clean.
- [ ] All binary assets present: `icon.png` (1024²), `adaptive-icon.png`, `splash.png`, `favicon.png`.
- [ ] Store assets ready: **feature graphic 1024×500** (Android), **screenshots** for every required device class (the most-forgotten item — see §4).
- [ ] Legal pages **publicly reachable** (privacy policy URL must resolve — Apple & Google both fetch it). No `YOUR_USERNAME.github.io` / `YOUR_EMAIL` placeholders left.
- [ ] Store copy describes the **actual** mechanics (validate against the real game/app — see [LESSONS.md](./LESSONS.md#store--metadata)).
- [ ] Feature flags point at real code or are `false` (e.g. an ads flag with no SDK wired = ship ad-free, flag `false`).
- [ ] `version` bumped in `app.json`; `production` profile has `autoIncrement: true` so build numbers self-increment.

---

## 3. ⏰ Lead-time items — start these on day 1, not at submit

| Item                              | Lead time   | Why it bites                                                            |
| --------------------------------- | ----------- | ---------------------------------------------------------------------- |
| **Google Play closed test**       | **14 days** | New Play accounts **must** run a closed test with **≥12 testers for 14 continuous days** before the Production track unlocks. Testers must *accept* the invite, not just be listed. |
| Apple Developer enrollment        | 1–3 days    | Identity verification can stall.                                       |
| App Store Connect app record      | minutes     | But needed before `eas submit` can target it.                         |
| Privacy policy hosting            | hours       | Must be live + public before review (GitHub Pages is fine).           |

**The closed-test rule is the critical path for Android.** Recruit the 12
testers (family/friends is fine) and start the test the day the first release
build exists — in parallel with everything else.

---

## 4. Store asset requirements (the checklist that gets forgotten)

**iOS (App Store Connect):**
- App icon 1024×1024 (no alpha, no rounded corners — Apple rounds it).
- Screenshots: 6.9" **and** 6.5" iPhone are the current required sizes; 5.5" if you still target it. iPad sizes only if iPad-enabled.

**Android (Play Console):**
- Icon 512×512.
- **Feature graphic 1024×500** (mandatory, easy to miss).
- Phone screenshots ×2 minimum (up to 8).

Keep masters in `store-assets/` (icon, feature graphic, per-device screenshots,
metadata `.md` files).

---

## 5. Build & submit

```bash
# iOS
eas build   --platform ios     --profile production
eas submit  --platform ios     --latest        # targets the ASC app record

# Android  (App Bundle for Production; APK only for internal/preview)
eas build   --platform android --profile production
eas submit  --platform android --latest
```

`eas.json` profiles (from the skeleton): `development` (dev-client, internal),
`preview` (internal release / TestFlight + Play internal), `production` (store,
`autoIncrement`, `appVersionSource: "remote"`).

**iOS after submit:** the build lands in TestFlight first → then submit for
App Review from App Store Connect.
**Android after submit:** promote the bundle through Internal → **Closed test
(the 14-day gate)** → Production.

---

## 6. Post-submit

- iOS review: typically 1–3 days; rejections usually cite metadata or privacy.
- Android review: hours–days, *after* the closed-test requirement is satisfied.
- Tag the release commit; add a `CHANGELOG.md` entry.
- Record anything that surprised you in [LESSONS.md](./LESSONS.md) — that's how
  the next app starts faster.

---

## Store submission toolkit

Reusable kit generalized from a real App Store launch (fill the `TODO(you)` placeholders):

- **[STORE_PLAYBOOK.md](STORE_PLAYBOOK.md)** — hard-won lessons & traps.
- **[../fastlane/README.md](../fastlane/README.md)** — automate the App Store listing via the ASC API (`fastlane ios metadata`); verify with `fastlane/scripts/asc-status.rb`.
- **[../store-assets/](../store-assets/)** — metadata templates + asset checklist (Play Data Safety, 12-testers × 14-days closed test).
- **[../web/](../web/)** + **[DEPLOY_WEBSITE.md](DEPLOY_WEBSITE.md)** — self-contained marketing + privacy/terms site (deploy before submitting).

The reusable ASC **team key** is at the repo root (`AuthKey_*.p8`, gitignored) with its ids in `fastlane/.env` (gitignored).
