# Store assets checklist

## App icon

- [ ] Source icon 1024×1024, **no alpha / no transparency** (App Store rejects alpha)
- [ ] `store-assets/app-icon-1024.png` (iOS marketing icon)
- [ ] Play uses 512×512 — export from the same source

## Screenshots

- [ ] iPhone **6.9"** — 1320×2868 (required; downscaled for smaller iPhones)
- [ ] iPad 13" — 2064×2752 (only if `supportsTablet`)
- [ ] Android phone — 16:9 or 9:16, min 320px, e.g. 1080×1920
- [ ] All **flattened (no alpha)**
- [ ] Put iOS shots in `fastlane/screenshots/en-US/` named `01_…`, `02_…` for order

Capture at a real device resolution, then scale to the exact required size:

```bash
sips -Z 2868 raw.png --out 01_home.png            # longest side → 2868 (6.9")
sips -s format png --deleteColorManagementProperties in.png --out flat.png  # strip alpha
```

## Google Play extras

- [ ] Feature graphic 1024×500 (`store-assets/feature-graphic.png`)

## Text

- [ ] `app-store-metadata.md` filled (name, subtitle, keywords, description)
- [ ] `play-store-metadata.md` filled (short + full description, Data Safety)
- [ ] Privacy policy + terms deployed and reachable (see `web/`)
