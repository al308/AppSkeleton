# Store submission playbook

Hard-won lessons from shipping Expo/EAS apps to the App Store & Google Play.
`RELEASE.md` is the checklist; this is the *why* and the traps. Pair with
`fastlane/README.md` (listing automation) and `docs/DEPLOY_WEBSITE.md` (privacy URL).

---

## Bundle ID

- Convention: `com.<account>.<app>` (e.g. `com.al3o8.myapp`). Keep iOS
  `bundleIdentifier` and Android `package` **identical** in `app.json`.
- It is **permanent** once the app exists in either store — decide before the
  first build/app-record.
- The **bundle id is not the SKU**. If the app record already exists, read the
  registered bundle id off the ASC App Information page (or `asc-status.rb`) and
  match `app.json` to *that* — don't assume your planned `com.<account>.<app>`.
  `deliver` looks the app up by **bundle id**; a mismatch crashes `find_app`
  with `undefined method 'team_id' for nil`.
- `ios/` and `android/` are **gitignored**, regenerated from `app.json` by EAS
  prebuild. After changing the bundle id, the local `ios/` keeps the old value
  until `expo prebuild --clean`, but EAS rebuilds it fresh — so store builds use
  `app.json`. Update every doc that names the id too.

## EAS build fails at "Install dependencies"

Almost always `npm ci` choking — reproduce locally with `npm ci` (that's what
EAS runs):

- **Lockfile out of sync** → `npm install` to regenerate, commit the lockfile.
- **Peer conflict** (e.g. `react-dom@19.2.x` pulled transitively wants
  `react@^19.2` but the SDK pins `react@19.1.0`) → pin the dep to the SDK version
  with `npx expo install <pkg>`, which writes the SDK-correct version.
- `.nvmrc` controls the EAS Node version; the lockfile must be valid for it.

## App Store Connect API key

- Use a **Team key** (Users and Access → Integrations → Team Keys), role
  **App Manager**. The **issuer id** is shared by all team keys.
- The **`.p8` downloads once**. Save it; it can't be re-downloaded. You cannot
  reuse a key whose `.p8` you don't have (e.g. the one EAS generated — Expo holds
  that `.p8`). One key is reusable across all your apps.
- Keep `.p8` out of git (`*.p8` is gitignored).

## The big one: the API key CANNOT create apps

The App Store Connect API has **no create-app endpoint**. `fastlane produce`
falls back to Apple ID and dies with `No value found for 'username'`. So:

1. Create the app **once in the ASC UI** (Apps → +), or run `produce` with an
   Apple ID.
2. Then `fastlane ios metadata` uploads text + screenshots fine with just the
   API key (deliver supports it).

Verify state with `fastlane/scripts/asc-status.rb` — don't trust fastlane's
noisy logs; query Apple directly.

## Screenshots

- Only **iPhone 6.9"** is required now (1320×2868 or 1290×2796); ASC downscales
  it for smaller iPhones. Don't bother with the 6.5"/6.7" sets.
- Dropping a 6.9" image into the 6.5" slot fails with "wrong dimensions".
- Must be **flattened — no alpha channel** (same for the 1024 marketing icon).

## fastlane deliver specifics

- Pass `api_key:` **explicitly** to deliver; relying on lane_context alone has
  let it fall back to legacy auth and fail with `team_id nil`.
- deliver **normalises** `metadata/*.txt` (strips trailing newlines) on upload —
  expect a small diff after the first run.
- Categories use API constants: `GAMES`, `GAMES_PUZZLE`, `GAMES_CASUAL`, …
- deliver can't set: **age rating**, **App Privacy labels**, **pricing**, build
  selection, review submission. Those stay manual in the UI.
- **No emoji** in `description.txt` / `release_notes.txt` — Apple rejects them
  (`Description can't contain the following character(s): …`). Plain `-`/`•`
  bullets and uppercase headers are fine; `×`, `—`, `'` are allowed.
- The **review phone** must be `+<country code> <number>` (e.g. `+49 1525 …`).
  An invalid/placeholder value fails late at `post_app_store_review_detail`.
- Running any deliver lane **regenerates `fastlane/README.md`**, which trips a
  format/pre-commit hook. Run your formatter as its **own** step after the lane
  (a chained `format && deliver` won't help — the hook checks before running).

## Privacy & data

- For offline, no-account apps: **Data Not Collected** (iOS App Privacy) and
  Play **Data Safety = No**. Local storage (AsyncStorage) is not "collection".
- Host the **privacy policy + terms** (see `web/`) and use the exact live URL in
  both stores. Deploy **before** submitting — the stores fetch it.

## Google Play closed testing

Google requires **12+ active testers over ≥ 14 days** on a closed track before
production. **Start it first** — it's the critical-path bottleneck.

## Truthful store text

Every feature in the description/screenshots must match the shipped build
(audio, modes, offline…). We once had to strip "Ambient soundtrack" lines because
the build shipped silent — mismatches risk rejection and mislead users.

## Honest reporting

For outward-facing steps (creating the app record, pushing a listing), verify
the real result against the source of truth before claiming success — a CLI
exit code or scrollback can lie. `asc-status.rb` exists for exactly this.
