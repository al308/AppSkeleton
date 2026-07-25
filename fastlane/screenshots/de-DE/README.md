# Screenshots (per locale)

Drop PNG/JPG screenshots here. fastlane `deliver` auto-detects the device from
the image dimensions and orders them alphabetically (so prefix `01_`, `02_`, …).

Only the **iPhone 6.9"** size is required now — App Store Connect downscales it
for all smaller iPhones, so you don't need the 6.5"/6.7" sets.

| Display | Accepted portrait sizes |
| --- | --- |
| iPhone 6.9" (required) | 1320 × 2868 or 1290 × 2796 |
| iPhone 6.5" (optional) | 1242 × 2688 or 1284 × 2778 |
| iPad 13" (if `supportsTablet`) | 2064 × 2752 or 2048 × 2732 |

Screenshots must be **flattened (no alpha channel)** or the upload is rejected.
Strip alpha with: `sips -s format png --deleteColorManagementProperties in.png --out out.png`
(or re-export without transparency).
