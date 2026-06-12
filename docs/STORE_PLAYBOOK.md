# Store submission playbook

Hard-won lessons from shipping Expo/EAS apps to the App Store & Google Play.
`RELEASE.md` is the checklist; this is the _why_ and the traps. Pair with
`fastlane/README.md` (listing automation) and `docs/DEPLOY_WEBSITE.md` (privacy URL).

---

## Bundle ID

- Convention: `com.<account>.<app>` (e.g. `com.al3o8.myapp`). Keep iOS
  `bundleIdentifier` and Android `package` **identical** in `app.json`.
- It is **permanent** once the app exists in either store — decide before the
  first build/app-record.
- The **bundle id is not the SKU**. If the app record already exists, read the
  registered bundle id off the ASC App Information page (or `asc-status.rb`) and
  match `app.json` to _that_ — don't assume your planned `com.<account>.<app>`.
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

## Submitting the binary (eas submit / --auto-submit)

The binary ships with `eas`, not fastlane: `eas build -p ios --profile production
--auto-submit` builds then uploads to App Store Connect.

- **Non-interactive submit needs `ascAppId`.** Put the app's **Apple ID** (the
  numeric id on the ASC App Information page, e.g. `6775036791`) under
  `submit.production.ios.ascAppId` in `eas.json`. An empty submit profile errors
  _"Set ascAppId in the submit profile … or re-run in interactive mode"_. The
  build still queues fine — only the submission step blocks, so just add the id
  and re-submit the finished build (`eas submit -p ios --id <BUILD_ID>`); no
  rebuild needed.
- Submission auths with the **EAS-managed `[Expo] EAS Submit` key**, separate
  from the local fastlane Team key. EAS holds its `.p8` — you don't.
- `eas submit --id <BUILD_ID>` only works once the build is **finished**; poll
  `eas build:view <BUILD_ID>` (full UUID from the build URL) until `finished`.
- After upload Apple **processes** the binary (~5–10 min) before it appears in
  TestFlight / can be attached to a version. deliver/metadata is independent of
  this — text can be live while the binary still processes.

## Android: eas submit & the service-account key

Unlike iOS (EAS-managed `[Expo] EAS Submit` key), Android `eas submit` needs
**your own Google Play service-account `.json`** — there is no EAS-managed
equivalent. Wire it once in `eas.json`:

```jsonc
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./play-service-account.json",
      "track": "internal"
    }
  }
}
```

- **Gitignore the key explicitly.** It's a `.json`, so `*.p8`/`*.key`/`*.jks`
  don't catch it. Add `play-service-account.json` to `.gitignore` _before_ you
  copy the key in.
- **One key, many apps.** A single service account can submit every app under the
  same Play developer account — the binding is set in Play Console → Setup → API
  access, not in the key's GCP project. (The skeleton's key came from a different
  app's GCP project and still works.) In practice: keep one key, `cp` it into each
  repo root as `play-service-account.json` (already gitignored), and point both
  `eas.json` and the Appfile at that name.
- **Verify reachability with `fastlane/scripts/play-status.rb`** — the read-only
  Android pendant to `asc-status.rb`. It answers "does the app exist on Play, and
  what's live on each track?" via the API. A clean `NO APP found` means the key
  authed fine and the app just isn't created in the Console yet; a permission
  error means the service account lacks API access to that app.
- **First track is `internal` / `closed`, not `production`.** A new account can't
  reach the Production track until the 12-tester / 14-day closed test has passed
  (see §"Google Play closed testing"). Submit to `internal` first, flip to
  `production` only after the gate clears.
- The first `.aab` can also just be **uploaded by hand** in the Console to seed
  the listing; `eas submit` automation is worth it from the second release on.

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
- **Play also wants a Feature Graphic: exactly 1024×500, no alpha** (iOS has no
  such asset). If the source is the wrong ratio, scale to width 1024 then
  centre-crop to height 500 rather than stretching — e.g.
  `sips --resampleWidth 1024 in.png --out t.png && sips -c 500 1024 t.png --out out.png`,
  then flatten the alpha against the splash/background colour.
- **Lint listing text before pushing:** `fastlane/scripts/check-play-metadata.sh`
  checks every locale against Play's limits (title ≤30, short ≤80, full ≤4000,
  changelog ≤500). The `fastlane android check` lane runs it before `supply
validate_only`, so an over-length field fails locally instead of at upload.

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
- Running any deliver lane **regenerates `fastlane/README.md`** and may touch the
  `metadata/*.txt`. Keep **`fastlane/` in `.prettierignore`** (this skeleton does)
  so those don't trip a format/pre-commit check. If a port forgets that entry,
  every deliver run leaves the tree "unformatted" and blocks the next commit.

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
