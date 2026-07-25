# Play Store listing metadata (fastlane supply)

`fastlane android metadata` reads this tree and pushes it to the Play Console.
The binary (`.aab`) is **not** uploaded here — that ships via `eas submit -p
android`. supply cannot create the app; the listing must already exist in the
Console (seed it with a first manual/internal upload) before the first push.

## Expected layout

```
fastlane/metadata/android/
└── en-US/                          # one dir per locale (de-DE, etc.)
    ├── title.txt                   # ≤ 30 chars
    ├── short_description.txt        # ≤ 80 chars
    ├── full_description.txt         # ≤ 4000 chars
    ├── changelogs/
    │   └── <versionCode>.txt        # ≤ 500 chars; filename = the Android versionCode
    └── images/
        ├── icon.png                 # 512×512
        ├── featureGraphic.png       # exactly 1024×500, NO alpha
        └── phoneScreenshots/        # 2–8 PNG/JPEG, e.g. 1320×2868 (portrait) or landscape
```

## Notes

- The skeleton ships **no** `en-US/` here on purpose — generate it per app.
  Mirror the iOS texts: `title ← name.txt`, `full_description ← description.txt`,
  `short_description ← subtitle.txt`, `changelogs/1.txt ← release_notes.txt`.
- `featureGraphic.png` is Play-only (iOS has no such asset) and must be exactly
  1024×500 with no alpha — see STORE_PLAYBOOK § Screenshots for the `sips` recipe.
- Validate before pushing: `fastlane android check` (supply `validate_only`).
- Pull the live listing back down with `fastlane android pull`.
