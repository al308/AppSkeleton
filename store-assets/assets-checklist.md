# Store assets checklist

Status as of this commit. ✅ = in the repo, 🔲 = still open.

## App icon

- [x] Source icon 1024×1024, **no alpha** — `assets/icon.png`
- [x] `store-assets/app-icon-1024.png` (iOS marketing icon, 1024×1024, no alpha)
- [x] `store-assets/app-icon-512.png` (Play icon, 512×512, no alpha) — mirrored to
      `fastlane/metadata/android/en-US/images/icon.png`

## Screenshots

- [x] iPhone **6.9"** — 1320×2868, flattened — `store-assets/screenshots/ios-6.9/`
      (01 title, 02 world select, 03 gameplay, 04 level select). Mirrored to
      `fastlane/screenshots/en-US/`.
- [x] Android phone — same 4 shots (same 1320×2868 source qualifies: 16:9,
      ≥320px) — `store-assets/screenshots/android-phone/`, mirrored to
      `fastlane/metadata/android/en-US/images/phoneScreenshots/`.
- [x] iPad 13" — 2064×2752 (03 gameplay is 2752×2064 landscape — no portrait
      gameplay capture was available, Apple accepts mixed orientation within
      a set) — `store-assets/screenshots/ios-ipad-13/`, mirrored to
      `fastlane/screenshots/en-US/ipad_*`. Required because `supportsTablet:
true` in `app.json` (unlike HarborChaos, which has it `false`).

Raw, unscaled simulator captures are kept under `store-assets/screenshots/raw/`
for future re-crops. Regenerate the flattened sets with:

```bash
magick raw.png -background "#0c0a24" -flatten -resize 1320x2868! tmp.png
magick tmp.png -alpha remove -alpha off "PNG24:out.png"   # sips alone leaves alpha=yes
```

`sips -Z` alone does not hit exact target dimensions (rounds to nearest even)
and `sips --deleteColorManagementProperties` does not strip the alpha channel
— ImageMagick's `-alpha remove -alpha off` with an explicit `PNG24:` output is
what actually satisfies "no alpha".

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
