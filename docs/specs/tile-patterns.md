# Spec: More tile patterns (glyphs, numbers, color shapes)

## Outcome

Expand the visual variety of pattern levels. Today a pattern level colors each
whole tile by a color group derived from its solved position. We add three new
kinds of variety:

1. **More color shapes** — additional `PatternShape` values that color whole
   tiles (same model as today): `waves`, `triangles`, `bordered_stripes`.
2. **Per-tile line glyphs** — a tile can additionally draw a simple line motif
   on top of its background color: horizontal lines, vertical lines, diagonal
   lines, grid/cross-hatch. This is a per-pattern style, not per-tile data.
3. **Number style** — a pattern whose tiles show their number prominently
   (a classic numbered sliding puzzle), independent of the level's
   `showNumbers` setting toggle.

## Scope

- Engine only for shapes (`src/engine/patterns.ts`).
- A new optional `glyph` and `style` field on `PatternDefinition` that the
  renderer reads. The glyph is uniform across a pattern (the _motif_), while the
  per-tile background color still comes from the color groups.
- `PuzzleTile` renders the glyph using plain `View`s (no new dependency — the
  "don't touch" rule forbids silent dep adds, and lines are cheap with Views).
- `PatternPreview` reflects the same glyph/number style so the level browser
  preview matches the in-game board.

## Out of scope

- New SVG/Canvas dependency.
- Changing solvability, shuffle, or solver behavior (patterns are cosmetic;
  the tile→group mapping that the solver uses is unchanged).
- Authoring brand-new levels beyond a small showcase set.

## Data model

```ts
type GlyphMotif = 'none' | 'lines_h' | 'lines_v' | 'lines_d' | 'lines_d2' | 'grid';
type PatternStyle = 'fill' | 'number';

type PatternDefinition = {
  shape: PatternShape;
  colorCount: number;
  palette: PaletteId;
  glyph?: GlyphMotif; // default 'none'
  style?: PatternStyle; // default 'fill'
};
```

Defaults keep every existing level definition valid and unchanged.

## New PatternShape values

- `waves` — sinusoidal horizontal bands: group =
  `floor(((row + amplitude*sin(col)) / size) * colorCount)`, clamped.
- `triangles` — split board into two triangles across the main diagonal,
  then band each half — gives a faceted look.
- `bordered_stripes` — vertical stripes, but the outer frame ring is forced to
  group 0 (a stripe pattern inside a solid border).

## Verification

- Functionality: each new shape produces `gridSize^2` tiles, every tile has a
  valid `#rrggbb` color, and group count ≤ `colorCount`.
- Glyph: a pattern with `glyph: 'lines_d'` renders diagonal-line Views in each
  non-blank tile (component test asserts the glyph testID is present).
- Number style: a pattern with `style: 'number'` shows the tile number even when
  the board's `showNumbers` is false.
- Command: `npm test` (engine + component tests), `npm run typecheck`, `just check`.
