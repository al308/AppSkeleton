# Spec: "Glyphen" world (third world, 12 levels)

## Context

Worlds today: `natur` (image levels) and `muster` (color-shape pattern levels).
The recent tile-pattern work (see `docs/specs/tile-patterns.md`) added line
glyphs (`lines_h/v/d/d2/grid`), a number style, and new shapes
(`waves`, `triangles`, `bordered_stripes`). The user wants more levels; image
worlds need binary assets we may not generate, so we add a third **asset-free**
world that showcases these new pattern features.

## Outcome

A new world `glyphen` with 12 playable pattern levels of escalating difficulty,
plus a corrected `muster` level count.

## Scope

- `src/data/worlds.ts` — add the `glyphen` `World` entry; fix `muster.totalLevels`
  from 12 → 15 (muster_13–15 were added previously but the count was not updated).
- `src/data/levels.ts` — add 12 `Level` objects (`world: 'glyphen'`,
  ids `glyphen_01`..`glyphen_12`, `shuffleSeed` 2101..2112). All `kind: 'pattern'`.
- No new engine code, no rendering changes, no assets.

## Design

- Difficulty ramps: 3×3 (relaxed) → 4×4 (normal/hard) → 5×5 (hard).
- Coverage across the new features: at least 3 with line `glyph`s (incl. `lines_d`,
  `lines_h`, `grid`), at least 2 with `style: 'number'`, and the new shapes
  (`waves`, `triangles`, `bordered_stripes`) each used at least once.
- `hintsAllowed` decreases as the grid grows (mirrors `muster`'s 5→2 ramp).
- `unlockStarThreshold` for `glyphen`: set so it sits "after" muster
  (muster=18). Use 36. Auto-unlock isn't wired yet (`DEV_UNLOCK_ALL = true`),
  so this is display-only for now — consistent with `muster`.

## Verification

- `npm run typecheck` — level/world objects satisfy `Level`/`World` types.
- `getLevelsForWorld('glyphen')` returns 12 (covered indirectly by typecheck +
  the home screen rendering all worlds).
- `just check` fully green (lint + types + tests).
- Manual (optional): `npm run start`, open the new world from home, confirm 12
  level cards render and glyph/number previews match in-game.
