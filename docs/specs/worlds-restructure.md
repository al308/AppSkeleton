# Spec: Worlds Restructure — Reorder, Level Normalization, Natur/Tiere Split, Realism Art Pass

Status: **Draft** · Owner: AL · Date: 2026-07-25

## Outcome

Four changes to the world/level structure, bundled because they all touch
`worlds.ts` / `levels.ts` / `worldThemes.ts` / `images.ts` / `asset-prompts.md`:

1. **Reorder worlds.** Menu order becomes: Natur · Tiere · Planeten ·
   Fahrzeuge · Glyphen · Sport · Kosmos · Muster · Urban. Muster moves from
   position 2 to position 8 (between Kosmos and Urban). A new world, Tiere,
   is inserted right after Natur.
2. **Split Natur / Tiere.** Natur becomes pure landscape imagery (no
   animals). A new world, **Tiere**, takes over the animal motifs.
3. **Normalize level count.** Every world — including the two legacy
   oversized ones — gets exactly **9 levels**: **9 distinct motifs**, 3 at
   grid size 3×3, 3 at 4×4, 3 at 5×5 (a deliberate break from the old
   Natur pattern of 3 motifs × 3 sizes — each level now has its own unique
   image). Muster (currently 15) and Glyphen (currently 12) are trimmed to
   9; the `LEGACY_LARGE_WORLDS` test exemption is removed since no world is
   oversized anymore.
4. **Realism art pass for Natur + Tiere.** New style standard —
   photorealistic photography, not painterly illustration — replaces the
   old stylized-illustration rule globally in `asset-prompts.md`. Only
   Natur and Tiere are actually regenerated in this pass (9 distinct
   images each = 18 total); the other 6 worlds keep their existing
   stylized images (and existing motif × 3-sizes structure) until a later
   pass regenerates and restructures them under the new standard.

## Scope

In scope:

- `src/data/worlds.ts` — reorder `WORLD_SEEDS`, add `tiere` seed.
- `src/data/worldThemes.ts` — add a `tiere` theme entry (new gradient/accent/
  frame, distinct from `natur`'s green).
- `src/data/levels.ts` — re-point Natur's 3 motifs to the new landscape
  set, add 9 new Tiere levels, trim Muster to 9 / Glyphen to 9.
- `src/data/images.ts` — registry entries for the new Natur + Tiere image
  keys.
- `docs/asset-prompts.md` — rewrite global style rule to photorealistic;
  rewrite World 1 (Natur) prompt list to the 9 approved motifs; add a new
  World section for Tiere with 9 approved motifs.
- `tools/genart/prompts.ts` (or equivalent per the existing genart
  pipeline) — prompt entries for the 18 new Natur+Tiere images.
- Any test asserting world count, level count, or `LEGACY_LARGE_WORLDS`
  (`tests/data/*` — exact files identified in Plan phase).
- Image generation run via the existing RunPod/ComfyUI pipeline
  (`tools/genart/*`) for the 18 Natur+Tiere images, staged for manual
  approval — **not** auto-committed.

Out of scope:

- Regenerating images for Planeten/Fahrzeuge/Glyphen/Sport/Kosmos/Muster/
  Urban — they keep current stylized assets this round.
- Changing the unlock star formula (`UNLOCK_STARS_PER_WORLD` stays 5;
  thresholds now span 9 worlds: 0, 5, 10, ..., 40).
- Changing `optimalMoves`/shuffle mechanics beyond what re-baking requires
  for new/changed levels.
- Migrating existing on-device star progress for trimmed Muster/Glyphen
  levels — per user decision, progress for removed level IDs simply lapses
  (no server-side or migrated local state; pre-launch, no production users
  affected).
- Auto-wiring generated images into `images.ts`/`levels.ts` — per the
  genart-pipeline spec, this stays a proposed diff reviewed before
  applying.

## Constraints

- Expo SDK 54, TS strict (+ `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`).
- Don't touch `assets/*.jpg`/`.png` binaries directly — only propose the
  registry wiring diff; real image files are approved and placed manually
  per the genart-pipeline workflow.
- `just check` green after every phase.
- New/changed levels need baked `optimalMoves` via the existing pipeline
  (`npx tsx tools/dump-levels.ts` → `python3 tools/precompute_solver.py`),
  same as any placeholder-level addition.
- Trimming Muster/Glyphen must pick the **strongest 9 motifs** each (by
  existing visual/gameplay quality, not arbitrary first-9) — proposed in
  the Plan phase for review, not decided silently.
- RunPod pod start requires explicit user go-ahead before it runs (real
  money) — per existing `genart-pipeline` constraint.

## Approved motifs

Each world has 9 distinct motifs, one image per level. Size assignment:
first 3 listed → 3×3, next 3 → 4×4, last 3 → 5×5.

### Natur (9 distinct motifs)

3×3 (easy):

1. **Gletscher** — glacier, dramatic ice formations, photorealistic
2. **Vulkan** — active volcano, glowing lava at night, photorealistic
3. **Geysir** — erupting geyser, backlit steam/spray, photorealistic

4×4 (medium):

4. **Felsküste** — dramatic rocky coastline, crashing waves, photorealistic
5. **Strand** — untouched tropical beach, turquoise water, photorealistic
6. **Weizenfeld** — golden wheat field at golden hour, photorealistic

5×5 (hard):

7. **Wolken** — dramatic cloudscape from above, photorealistic aerial
8. **Bergsee** — alpine lake with mirror reflection, photorealistic
9. **Herbstwald** — autumn forest canopy, vivid color, photorealistic

### Tiere (9 distinct motifs)

3×3 (easy):

1. **Adler im Sturzflug** — golden eagle diving, talons out, mountain
   backdrop, photorealistic wildlife photography
2. **Orca-Breach** — orca breaching fully out of the ocean, spray, dramatic
   photorealistic wildlife photography
3. **Schneeleopard** — snow leopard on a rocky ledge in a snowstorm, rare/
   iconic, photorealistic wildlife photography

4×4 (medium):

4. **Tiger-Sprung** — Bengal tiger leaping through tall grass, motion,
   photorealistic wildlife photography
5. **Kolibri-Schwebeflug** — hummingbird hovering at an exotic flower,
   wings frozen mid-beat, macro, photorealistic
6. **Pfau-Rad** — peacock full display, backlit iridescent feathers,
   photorealistic

5×5 (hard):

7. **Chamäleon-Makro** — chameleon mid color-change / tongue strike,
   texture detail, photorealistic macro
8. **Wanderfalke** — peregrine falcon in a stoop dive, low-angle dramatic
   perspective, photorealistic
9. **Tiefsee-Qualle** — deep-sea jellyfish, bioluminescent glow, surreal,
   photorealistic

All 9 approved motifs per world ship as levels this round — no reserve list.

## Design

### World order & new world

```ts
// worlds.ts WORLD_SEEDS, in order:
(natur, tiere, planeten, fahrzeuge, glyphen, sport, kosmos, muster, urban);
```

`unlockStarThreshold = index * 5` falls out automatically from array order
(0, 5, 10, 15, 20, 25, 30, 35, 40) — no hardcoding needed, per the existing
`worlds.ts` convention.

### Tiere theme

New entry in `WORLD_THEMES`, visually distinct from Natur's green — e.g. a
warm amber/tan palette evoking savanna/wildlife, finalized in the Plan
phase alongside a quick visual sanity check against neighboring worlds
(Planeten's orange, Fahrzeuge's red) to avoid clashing.

### Level trimming (Muster, Glyphen)

Both currently exceed 9 levels (15 and 12 respectively) with motifs
repeated across grid sizes. Plan phase proposes which 9 motifs survive per
world (with rationale) for user sign-off before `levels.ts` is edited —
trimmed down to the same 9-distinct-motifs / 3-per-size shape as Natur and
Tiere, for structural consistency across all worlds.

### Genart pipeline reuse

Follows the flow already built in `tools/genart/` (`runpod.mjs` →
`generate.mjs` → `ingest.mjs`), same as the Planeten batch-size sanity
check from the prior pipeline spec. New prompts follow the new
photorealistic style rule instead of the old painterly one.

## Verification criteria

- **Phase 1 — Reorder + split (code only, no new images yet).**
  Functionality: `WORLDS` array reflects new order and includes `tiere`;
  unlock thresholds recompute correctly (0..40); `worldThemes.ts` has a
  `tiere` entry; app renders the world carousel in the new order with
  correct per-world accent colors. Tests: existing world/theme data-
  invariant tests pass with `tiere` included; `just check` green.
- **Phase 2 — Level normalization.** Functionality: every world has
  exactly 9 levels, 9 distinct motifs (3 at 3×3, 3 at 4×4, 3 at 5×5);
  `LEGACY_LARGE_WORLDS` exemption removed from the invariant test since
  it's no longer needed.
  Tests: level-count invariant test updated and green; `optimalMoves`
  baked for any newly added/changed level via the existing solver
  pipeline; `just check` green.
- **Phase 3 — Prompts + doc rewrite.** `asset-prompts.md` style rule
  updated to photorealistic; Natur section rewritten to the 9 approved
  motifs; new Tiere section added with 9 approved motifs. Verification:
  manual read-through against the approved motif list above.
- **Phase 4 — Image generation (Natur + Tiere, 18 distinct source images,
  one per level, no reuse across grid sizes).** Run via `tools/genart/`
  pipeline: user confirms RunPod pod start (cost), images generated +
  staged, `exiftool` provenance check passes, visually reviewed against
  prompts and approved by user. `images.ts`/`levels.ts` wiring proposed as
  a diff, applied only after approval.
