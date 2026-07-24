# Store assets checklist

Status as of this commit. ✅ = in the repo, 🔲 = still open.

## App icon

- [x] Source icon 1024×1024, **no alpha** — `assets/icon.png`
- [x] `store-assets/app-icon-1024.png` (iOS marketing icon, 1024×1024, no alpha)
- [x] `store-assets/app-icon-512.png` (Play icon, 512×512, no alpha) — mirrored to
      `fastlane/metadata/android/en-US/images/icon.png`

## Screenshots

- [ ] iPhone **6.9"** — 1320×2868, flattened — `store-assets/screenshots/ios-6.9/`
      (suggest: title, two gameplay shots, level select). Mirror numbered
      (`01_…`) into `fastlane/screenshots/en-US/` for `deliver`.
- [ ] Android phone — same shots, `store-assets/screenshots/android-phone/`,
      mirrored into `fastlane/metadata/android/en-US/images/phoneScreenshots/`
- [ ] iPad 13" — 2064×2752 or 2048×2732, flattened — `supportsTablet: true` in
      `app.json`, so this set is **required**, unlike HarborChaos (which has
      `supportsTablet: false` and skips it). Mirror into
      `fastlane/screenshots/en-US/` alongside the iPhone set.

Capture at a real device/simulator resolution, then scale to the exact size:

```bash
sips -Z 2868 raw.png --out 01_home.png            # longest side → 2868 (6.9")
sips -s format png --deleteColorManagementProperties in.png --out flat.png  # strip alpha
```

## Google Play extras

- [x] Feature graphic 1024×500 — `store-assets/feature-graphic.png`, mirrored to
      `fastlane/metadata/android/en-US/images/featureGraphic.png`

## Text

- [x] `app-store-metadata.md` filled (name, subtitle, keywords, description, URLs,
      copyright, review contact)
- [x] `play-store-metadata.md` filled (short + full description, Data Safety)
- [x] `fastlane/metadata/**` filled (iOS + Android) and mirrored
- [ ] Privacy policy + terms deployed and reachable — currently returns
      **401 Basic Auth** at https://shiffle.tenfives.com/ and
      `/legal/privacy-policy.html`. Must be public (200) before submit; the
      stores fetch this URL.

## Still manual in the store consoles (not automatable)

- 🔲 App Store: create the app record in ASC, App Privacy labels, age rating
  (4+), pricing (Free), select build, Submit for Review
- 🔲 Set the real numeric Apple ID in `eas.json` → `submit.production.ios.ascAppId`
  once the app record exists (currently a `TODO` placeholder)
- 🔲 Google Play: `play-service-account.json` is missing from the repo root —
  fetch it from Play Console (Setup → API access) before `eas submit -p android`
  can authenticate
- 🔲 Google Play: Data Safety form, content rating questionnaire, closed-testing
  track (12+ testers / 14 days — start early, it's the long pole)
- 🔲 Binary ships via `eas build -p ios --profile production --auto-submit`
  (not fastlane); listing text/screenshots via `fastlane ios metadata` /
  `fastlane android metadata`
