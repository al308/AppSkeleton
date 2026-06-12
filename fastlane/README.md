# fastlane — App Store Connect listing automation

Pushes the **iOS App Store listing** (text metadata + screenshots) via the App
Store Connect API. The app **binary** ships with `eas submit`; these lanes never
upload a binary and never auto-submit for review.

Source of truth for the text is `store-assets/` — the files under
`fastlane/metadata/` are the deliver-formatted copies.

> This is a template. Replace `com.example.app`, `MyApp`, URLs, and the metadata
> text. Search for `TODO(you)`.

---

## One-time setup

### 1. Install

```bash
brew install fastlane     # or: bundle install (uses the Gemfile)
```

### 2. App Store Connect API key (Team key)

App Store Connect → **Users and Access → Integrations → App Store Connect API →
Team Keys** → generate, role **App Manager**. Download the `.p8` — **it's only
downloadable once**. The issuer id is shown above the key table and is shared by
all team keys.

> You can reuse one team key across all your apps (keys are account-wide, not
> per-app). You **cannot** reuse a key whose `.p8` you no longer have (e.g. the
> one EAS created — its `.p8` lives only in Expo's store). Don't pick "Individual
> keys"; they have no shared issuer id and are fiddlier with fastlane.

```bash
export ASC_KEY_ID="XXXXXXXXXX"
export ASC_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export ASC_KEY_PATH="$PWD/AuthKey_XXXXXXXXXX.p8"   # gitignored (*.p8)
```

### 3. ⚠️ Create the app record first (one-time)

**The API key cannot create apps** — the App Store Connect API has no create-app
endpoint, so `fastlane ios create_app` (produce) falls back to Apple ID and
errors with `No value found for 'username'`. Create it once:

App Store Connect → **Apps → + → New App**
- iOS · Name · Primary language **English (U.S.)**
- Bundle ID = your `app.json` id (EAS registers it on first `eas build`, or add
  it under Certificates, Identifiers & Profiles)
- **SKU** — your choice, **permanent**, account-unique (the bundle id is a fine value)

(Or run `create_app` with an Apple ID: `apple_id` in `Appfile` / `PRODUCE_USERNAME`.)

### 4. Fill the review phone number

`fastlane/metadata/review_information/phone_number.txt` is a placeholder. Put a
real number before submitting (App Review requires it). This folder is only read
at submit time — don't push a placeholder live.

---

## Commands

```bash
fastlane ios metadata      # text + screenshots (no binary, no review submit)
fastlane ios text          # text only
fastlane ios screenshots   # screenshots only
fastlane ios status        # read-only: what's ACTUALLY live (wraps asc-status.rb)
fastlane ios pull          # download live metadata into fastlane/metadata
```

Works once the app record exists (step 3); deliver authenticates with the API key.

---

## What deliver manages vs. manual

✅ name, subtitle, promo text, description, keywords, URLs, release notes,
   copyright, categories, screenshots (6.9", auto-detected).

🛠️ Manual in App Store Connect (deliver/API can't): create the app, **age rating**
   questionnaire, **App Privacy** nutrition labels, **pricing**, selecting the
   build, and **Submit for Review**.

---

## Gotchas learned the hard way

- **API key ≠ app creation.** See step 3.
- **Right slot for screenshots.** 1320×2868 is the *6.9"* size; dropping it in
  the 6.5" slot fails ("falsche Maße"). You only need 6.9".
- **No alpha** in screenshots or the upload is rejected.
- **deliver normalises** `metadata/*.txt` on upload (strips trailing newlines) —
  expect a small diff after the first run.
- **Categories** use API constants (`GAMES`, `GAMES_PUZZLE`, `GAMES_CASUAL`, …).
  If deliver rejects them, set the category in the UI once.
- **Keep `.p8` out of git** (the `*.p8` ignore handles it) and **truthful store
  text** (don't claim features the build doesn't have).

---

## Android (Google Play)

`platform :android` in the Fastfile manages the **Play listing** (text + feature
graphic + screenshots) via `fastlane supply`. The `.aab` binary ships with
`eas submit -p android` — these lanes never upload a binary.

### Auth: Play service-account key

Unlike iOS (where EAS holds the submit key), Android auth needs **your own
Google Play service-account `.json`**:

1. Play Console → **Setup → API access** → link a GCP project → create a service
   account → grant it **Release Manager** role.
2. Download the JSON key → save as `play-service-account.json` at the repo root
   (already gitignored as a `.json` — the generic `*.p8`/`*.key` globs miss it).
3. One key works for every app under the same Play developer account.

### Commands

```bash
fastlane android metadata   # text + feature graphic + screenshots (no binary)
fastlane android check      # lint metadata lengths + validate payload (no upload)
fastlane android pull       # download live Play listing into fastlane/metadata/android
```

### Verify

`fastlane/scripts/play-status.rb` queries the Android Publisher API directly:

```bash
SUPPLY_JSON_KEY=./play-service-account.json \
  PLAY_PACKAGE=com.example.app ruby fastlane/scripts/play-status.rb
```

`NO APP found` = key authed fine, app not in Console yet (supply can't create
it — seed with a first manual upload). A permission error = service account
needs API access in Play Console.

### Gotchas

- **supply can't create the app** — seed it with a first `.aab` in the Console.
- **First binary track is `internal`**, not `production` (new accounts need the
  12-tester / 14-day closed test first; see `docs/RELEASE.md §3`).
- **Feature Graphic: exactly 1024×500, no alpha** (`sips --resampleWidth 1024`
  then `sips -c 500 1024`, then flatten alpha).
- **Lint lengths before pushing** — `fastlane android check` catches over-limit
  fields locally before any API call.
