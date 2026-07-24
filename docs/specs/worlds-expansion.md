# Spec: Worlds Expansion, Per-World Theming, Swipe-Fix & Unlock Rebalance

Status: **Done** · Owner: AL · Date: 2026-06-27

## Outcome

Four independent improvements, shipped together because they touch the same data
model (`worlds.ts` / `levels.ts`) and screens:

1. **Swipe-Fix.** Tile-by-finger movement currently feels broken — only tapping
   works reliably. Make the swipe gesture robust **and** wire the existing
   `controlMode` setting (`tap` / `swipe` / `both`), which today is read by
   nothing. No live-follow drag (explicit decision) — swipe stays a directional
   flick that triggers a discrete move.
2. **Per-World feeling.** Each world gets its own visual identity: gradient,
   accent, and frame/border colors driven by a per-world theme token. A
   background-image slot is designed into the data model **now** (optional field
   - resolver) so real organic textures / backdrops can drop in later without a
     schema change. For this release the rendered backdrop is procedural
     (gradient + accent), not a PNG.
3. **More worlds.** Grow from 3 to **8** worlds, each with **5–9** levels. New
   worlds ship with **placeholder** sources (procedural patterns) until real
   image assets are produced over time. Asset folders + image-registry entries
   are scaffolded so adding a PNG is a one-line change.
4. **Unlock rebalance.** Stars are hard to earn, so the per-world gate drops to
   **cumulative +5 total stars per world** (0, 5, 10, 15, 20, 25, 30, 35).

## Scope

In scope: `worlds.ts`, `levels.ts`, `images.ts`, per-world theme module,
`GameBackground` (world-aware), `WorldCoverCard` framing, `PuzzleBoard` gesture
logic, `worlds.tsx` / `world/[id].tsx` / `game/[id].tsx` wiring, asset folder
scaffolding, tests.

Out of scope: producing real image assets (done by the user over time);
live-follow drag; changing the star **formula** (`computeStars` stays 1.3× / 2×);
solver/optimalMoves precompute for the new placeholder levels beyond what the
existing pipeline yields (placeholders may carry `optimalApprox`).

## Constraints

- Expo SDK 54, TS strict (+ `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- Don't touch `assets/*.png` binaries — only create folders + `.gitkeep` and a
  documented registry seam; real PNGs are added by the user.
- New worlds must not lower any existing world's behavior; existing 3 worlds keep
  their level data and seeds.
- `just check` green after every phase.

## Design

### World order (interleaved; Muster & Glyphen not adjacent)

| #   | id          | Titel      | Art          | unlock ★ | levels          |
| --- | ----------- | ---------- | ------------ | -------- | --------------- |
| 1   | `natur`     | Natur      | Bild         | 0        | 9               |
| 2   | `muster`    | Muster     | Pattern      | 5        | 9 (→ trim/keep) |
| 3   | `planeten`  | Planeten   | Bild (PH)    | 10       | 6               |
| 4   | `fahrzeuge` | Fahrzeuge  | Bild (PH)    | 15       | 8               |
| 5   | `glyphen`   | Glyphen    | Pattern      | 20       | 9 (→ trim/keep) |
| 6   | `sport`     | Sportarten | Bild (PH)    | 25       | 6               |
| 7   | `kosmos`    | Kosmos     | Pattern (PH) | 30       | 5               |
| 8   | `urban`     | Urban      | Bild (PH)    | 35       | 6               |

Order interleaves concrete (Natur, Planeten, Fahrzeuge, Sport, Urban) with
abstract (Muster, Glyphen, Kosmos); Muster (2) and Glyphen (5) are separated.
Counts stay 5–9. New worlds use procedural placeholder sources until assets land.

### Data model changes

`World` gains:

```ts
type WorldTheme = {
  gradient: readonly [string, string, string]; // backdrop top→bottom
  accent: string; // primary accent
  frame: string; // tile/board frame color
  backgroundImage?: ImageAssetKey; // optional, future organic texture
};
```

`World` gains `theme: WorldTheme`. `accentColor` is kept (derived from
`theme.accent`) for back-compat with `WorldCoverCard` or migrated.

### Swipe + control mode

- `PuzzleBoard` receives `controlMode: ControlMode`.
- `tap` → only `tapGesture`; `swipe` → only `panGesture`; `both` → `Gesture.Race`.
- Harden `panGesture`: lower/clearer threshold, robust tile-cell hit-test,
  guard off-board, reject wrong-direction with the existing shake. Keep
  `runOnJS(handleTap)` discrete-move semantics.

### Unlock

`unlockStarThreshold` per world = `index * 5`. `worldsUnlockedBy` unchanged
(already sums total stars vs threshold).

## Verification criteria

- Swipe moves a tile toward the gap on a real device/sim; `controlMode=tap`
  disables swipe; `controlMode=swipe` disables tap. (manual + unit test on gesture
  composition selection)
- Each world renders its own gradient/accent backdrop; cover frame matches.
- `WORLDS.length === 8`; every world has 5–9 levels; `getLevelsForWorld` non-empty
  for each. (data invariant test)
- Thresholds are `[0,5,10,15,20,25,30,35]`. (data test)
- Placeholder image worlds resolve to a procedural source (no missing-require
  crash). (data/registry test)
- `just check` green.
