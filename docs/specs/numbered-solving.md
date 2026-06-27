# Spec: Numbered tiles enforce exact order

## Outcome

When a pattern level's tiles show **distinguishable numbers**, the puzzle is only
"solved" when the tiles are in exact numeric order — not merely when the color
groups match. Win-detection, the live "remaining moves" estimate, the hint solver,
and the baked `optimalMoves` value must all agree with what the player sees.

### Motivation

Today every pattern level passes a `tileGroupMap` into `isSolved`, so any
permutation of same-colored tiles counts as solved (concept.md §3.2 / §5.4). That
is correct when tiles are visually identical. But when numbers are shown, the
tiles are no longer interchangeable: the UI signals "every tile has a fixed
home," while the engine still accepts a color-only solution. That inconsistency
is the bug this spec fixes.

## Trigger: when are numbers "shown"?

Numbers are considered shown — and exact order is required — when **either**:

1. The global setting `tileNumbersVisible` is on (live toggle), **or**
2. The pattern itself has `style: 'number'` (numbers baked into the level,
   independent of the toggle — see [tile-patterns.md](tile-patterns.md)).

Otherwise (fill style, numbers off): color-group solving is used, as today.

## Behavior

"Exact numeric order" is identical to the standard non-pattern solved state
`[1, 2, …, n²−1, 0]`. The implementation does **not** need new solver logic — it
needs the `tileGroupMap` to be _omitted_ (i.e. treated as a plain numeric puzzle)
whenever numbers are shown.

| Surface                | Numbers shown                  | Numbers hidden (fill)           |
| ---------------------- | ------------------------------ | ------------------------------- |
| `isSolved`             | numeric goal (no tileGroupMap) | color-group goal (tileGroupMap) |
| Live "remaining moves" | exact / lower-bound estimate   | `unknown` (hidden), as today    |
| Hint solver            | solves toward numeric goal     | unchanged                       |
| Star rating            | uses numeric `optimalMoves`    | uses color-group optimal        |

## optimalMoves consequence (ties into P1)

A pattern level can have **two** optimal counts from the same shuffled state:

- `optimalMoves` — exact numeric solve (this is the standard solved state, so it
  is the same value a non-pattern level of equal size+seed would have).
- `optimalMovesPattern` — shortest path to _any_ valid color-group arrangement
  (≤ the numeric one).

Star rating picks the count matching the active mode (numbers shown → numeric).
The precompute script (P1) bakes both for pattern levels; numeric-only for image
levels. If only one is feasible to compute, bake the numeric one (it always
exists and matches the strict mode).

## Out of scope

- Changing shuffle, solvability, or the PRNG.
- Re-authoring level definitions (only data values change, no structural edits).
- Per-level override of the rule (the trigger above is global + style-driven).

## Verification

- A 2-color pattern, numbers **off**: solving to matching colors wins. (existing test stays green)
- The same level, numbers **on**: matching colors but scrambled numbers does **not** win;
  exact numeric order wins.
- A `style: 'number'` level: exact order required even with `tileNumbersVisible` off.
- Live HUD shows a remaining-moves number when numbers are on (not `—`).
- Star rating on a numbered solve uses the numeric `optimalMoves`.
- Command: `npm test`, `npm run typecheck`, `just check`.
