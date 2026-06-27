# Apple App Store metadata

Human-readable source of truth for the App Store listing. The `fastlane/metadata/`
files mirror these — keep them in sync (or treat fastlane as the source and this
as the reference). Character limits are Apple's.

| Field            | Limit | Value                                                                                                                 |
| ---------------- | ----- | --------------------------------------------------------------------------------------------------------------------- |
| App Name         | 30    | Shiffle                                                                                                               |
| Subtitle         | 30    | Slide. Solve. Relax.                                                                                                  |
| Promotional Text | 170   | 36 handcrafted sliding puzzles across three worlds — photos, patterns and glyphs. No ads, no tracking, fully offline. |
| Keywords         | 100   | sliding puzzle,15 puzzle,brain,logic,tile,relax,offline,casual,puzzle,number                                          |
| Description      | 4000  | (see below)                                                                                                           |

- **Support URL / Marketing URL:** https://shiffle.tenfives.com/
- **Privacy Policy URL:** https://shiffle.tenfives.com/legal/privacy-policy.html (must be live before submit)
- **Primary category:** Games → Puzzle · **Secondary subcategory:** Games → Casual
- **Age rating:** 4+ (no objectionable content)
- **Copyright:** 2026 tenfives
- **Pricing:** Free (no ads, no IAP)

## Description (full text)

```
Shiffle is a calm, modern take on the classic sliding puzzle.

Slide the tiles, rebuild the picture, solve the pattern. Three worlds, 36
handcrafted levels, and a difficulty curve that grows with you from a gentle
3×3 up to a proper 5×5 challenge.

THREE WORLDS
• Natur — restore beautiful animal and landscape photos
• Muster — solve geometric colour patterns built from pure vector art
• Glyphen — lines, numbers and abstract shapes

BUILT TO FEEL GOOD
• Tap or swipe to move — your choice
• Optional move counter, timer and "moves to go" hint
• Up to three stars per level, with a personal best for every puzzle
• Built-in training that teaches the row-by-row solving method
• Hints and a reference preview when you get stuck
• Haptic feedback, smooth animations, light and dark themes

PRIVATE BY DESIGN
• Works completely offline
• No ads, no in-app purchases, no accounts
• No data collection and no tracking — your progress stays on your device

Slide. Solve. Relax.
```

## App Review notes (paste into "Notes")

> Shiffle is an offline single-player sliding-puzzle game. There is no login, no
> ads, no in-app purchases and no network calls. All progress is stored locally
> on the device via AsyncStorage. No test account is needed. To exercise it:
> open a world from the home carousel, tap or swipe tiles to solve a puzzle,
> complete it to earn stars and unlock the next level.

## Keep claims truthful

Every feature named here matches the shipped build: 3 worlds, 36 levels, tap +
swipe, timer/moves/optimal HUD, stars, training, hints, reference preview,
haptics, light/dark theme, offline, no ads/IAP/accounts, no data collection.
v1 ships **silent** (no audio) — do not claim sound.
