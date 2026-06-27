import { createSolvedState, isSolved, type PuzzleState } from '../../src/engine/puzzle';
import {
  derivePatternTiles,
  buildTileGroupMap,
  type PatternDefinition,
} from '../../src/engine/patterns';

// A 2-color horizontal-stripe pattern: tiles in the same row share a color group,
// so they are interchangeable when solving by color.
const pattern: PatternDefinition = { shape: 'stripes_h', colorCount: 2, palette: 'warm' };
const SIZE = 3;
const tileGroupMap = buildTileGroupMap(derivePatternTiles(pattern, SIZE));

// Find two non-blank tiles that sit in the same color group, and build a state
// that swaps them. Colors still match the goal everywhere, but the numbers don't.
function colorValidButNotNumeric(): PuzzleState {
  const solved = createSolvedState(SIZE);
  const tiles = [...solved.tiles];
  const groupOf = (id: number): string => tileGroupMap.get(id) ?? String(id);

  for (let a = 0; a < tiles.length; a++) {
    for (let b = a + 1; b < tiles.length; b++) {
      const ta = tiles[a]!;
      const tb = tiles[b]!;
      if (ta === 0 || tb === 0) continue;
      if (groupOf(ta) === groupOf(tb)) {
        tiles[a] = tb;
        tiles[b] = ta;
        return { ...solved, tiles };
      }
    }
  }
  throw new Error('expected at least one interchangeable pair in a 2-color stripe pattern');
}

describe('numbered vs color-group win detection', () => {
  it('treats a color-valid swap as solved when solving by color group', () => {
    const state = colorValidButNotNumeric();

    expect(isSolved(state, tileGroupMap)).toBe(true);
  });

  it('does NOT treat the same swap as solved in strict numeric order (numbers shown)', () => {
    const state = colorValidButNotNumeric();

    expect(isSolved(state)).toBe(false);
  });

  it('treats exact numeric order as solved in strict mode', () => {
    const solved = createSolvedState(SIZE);

    expect(isSolved(solved)).toBe(true);
  });
});
