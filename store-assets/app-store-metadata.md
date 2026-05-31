# Apple App Store metadata (template)

Human-readable source of truth for the App Store listing. The `fastlane/metadata/`
files mirror these — keep them in sync (or treat fastlane as the source and this
as the reference). Character limits are Apple's.

| Field | Limit | Value |
| --- | --- | --- |
| App Name | 30 | MyApp |
| Subtitle | 30 | Short tagline |
| Promotional Text | 170 | Updatable without a new build |
| Keywords | 100 | comma,separated,no,spaces,after,commas |
| Description | 4000 | … |

- **Support URL / Marketing URL:** https://example.com/
- **Privacy Policy URL:** https://example.com/legal/privacy-policy.html (must be live before submit)
- **Primary category:** Games → Puzzle · **Secondary subcategory:** Games → Casual
- **Age rating:** set the questionnaire result (e.g. 4+) in the UI — not settable via deliver
- **Copyright:** 2026 Your Name
- **Pricing:** Free (no ads, no IAP)

## App Review notes (paste into "Notes")

> Describe what the app does, how to exercise it, and the monetization /
> permissions / account facts. For an offline single-player app: no login, no
> ads, no IAP, no network calls; data stored locally only; no test account needed.

## Keep claims truthful

Every feature named in the description/screenshots must match the shipped build
(audio, modes, offline, etc.). Mismatches risk rejection and mislead users.
