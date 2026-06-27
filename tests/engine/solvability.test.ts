import { isSolvable, ensureSolvable } from '../../src/engine/solvability';
import { createSolvedState } from '../../src/engine/puzzle';
import { shuffleFromSeed } from '../../src/engine/shuffle';

describe('isSolvable', () => {
  it('solved state is solvable', () => {
    expect(isSolvable(createSolvedState(3))).toBe(true);
    expect(isSolvable(createSolvedState(4))).toBe(true);
  });

  it('known unsolvable 3x3 state', () => {
    // Swap tiles 1 and 2 in solved state → unsolvable
    const state = createSolvedState(3);
    const tiles = [...state.tiles];
    const tmp = tiles[0]!;
    tiles[0] = tiles[1]!;
    tiles[1] = tmp;
    expect(isSolvable({ ...state, tiles })).toBe(false);
  });

  it('shuffled states are solvable', () => {
    for (const seed of [1, 42, 999, 12345]) {
      const state = shuffleFromSeed(3, 'hard', seed);
      expect(isSolvable(state)).toBe(true);
    }
  });
});

describe('ensureSolvable', () => {
  it('leaves solvable state unchanged', () => {
    const state = createSolvedState(3);
    expect(ensureSolvable(state).tiles).toEqual(state.tiles);
  });

  it('fixes unsolvable state', () => {
    const state = createSolvedState(3);
    const tiles = [...state.tiles];
    const tmp = tiles[0]!;
    tiles[0] = tiles[1]!;
    tiles[1] = tmp;
    const fixed = ensureSolvable({ ...state, tiles });
    expect(isSolvable(fixed)).toBe(true);
  });
});
