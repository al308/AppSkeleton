import { mulberry32, shuffleFromSeed } from '../../src/engine/shuffle';
import { isSolved } from '../../src/engine/puzzle';

describe('mulberry32', () => {
  it('produces deterministic output for same seed', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    expect(rng1()).toBe(rng2());
    expect(rng1()).toBe(rng2());
  });

  it('produces different output for different seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('output is in [0, 1)', () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('shuffleFromSeed', () => {
  it('produces deterministic shuffle for same seed', () => {
    const s1 = shuffleFromSeed(3, 'normal', 12345);
    const s2 = shuffleFromSeed(3, 'normal', 12345);
    expect(s1.tiles).toEqual(s2.tiles);
  });

  it('shuffled state is not solved (with high confidence)', () => {
    const state = shuffleFromSeed(3, 'hard', 99999);
    expect(isSolved(state)).toBe(false);
  });

  it('shuffled state contains all tiles', () => {
    const state = shuffleFromSeed(4, 'normal', 1);
    const sorted = [...state.tiles].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('blank index is consistent with tiles array', () => {
    const state = shuffleFromSeed(3, 'relaxed', 7);
    expect(state.tiles[state.blankIndex]).toBe(0);
  });
});
