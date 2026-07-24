import {
  worldsUnlockedBy,
  computeStars,
  useProgressStore,
  type PuzzleRecord,
} from '../../src/store/progressStore';
import { WORLDS, UNLOCK_STARS_PER_WORLD } from '../../src/data/worlds';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const muster = WORLDS.find((w) => w.id === 'muster')!;
const glyphen = WORLDS.find((w) => w.id === 'glyphen')!;

function recordsWithStars(total: number): Record<string, PuzzleRecord> {
  const records: Record<string, PuzzleRecord> = {};
  let remaining = total;
  let i = 0;
  while (remaining > 0) {
    const stars = Math.min(3, remaining) as 1 | 2 | 3;
    records[`lvl_${i}`] = {
      levelId: `lvl_${i}`,
      completions: 1,
      bestMoves: 10,
      bestTime: 1000,
      stars,
      lastPlayedAt: '2026-01-01T00:00:00.000Z',
      hintsUsedTotal: 0,
    };
    remaining -= stars;
    i += 1;
  }
  return records;
}

describe('world unlock thresholds', () => {
  it('starts at zero and steps by the per-world amount in menu order', () => {
    WORLDS.forEach((world, index) => {
      expect(world.unlockStarThreshold).toBe(index * UNLOCK_STARS_PER_WORLD);
    });
  });
});

describe('worldsUnlockedBy', () => {
  it('keeps later worlds locked below their threshold', () => {
    const result = worldsUnlockedBy(recordsWithStars(muster.unlockStarThreshold - 1), ['natur']);

    expect(result).toEqual(['natur']);
  });

  it('unlocks a world once its star threshold is reached', () => {
    const result = worldsUnlockedBy(recordsWithStars(muster.unlockStarThreshold), ['natur']);

    expect(result).toContain('muster');
    expect(result).not.toContain('glyphen');
  });

  it('unlocks every world when the highest threshold is met', () => {
    const result = worldsUnlockedBy(recordsWithStars(glyphen.unlockStarThreshold), ['natur']);

    expect(result).toContain('muster');
    expect(result).toContain('glyphen');
  });

  it('returns the same array reference when nothing changes (no needless re-render)', () => {
    const already = ['natur'];
    const result = worldsUnlockedBy(recordsWithStars(0), already);

    expect(result).toBe(already);
  });
});

describe('unlockAllWorlds', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('unlocks every world id', () => {
    useProgressStore.getState().unlockAllWorlds();

    expect(useProgressStore.getState().unlockedWorldIds.sort()).toEqual(
      WORLDS.map((world) => world.id).sort(),
    );
  });

  it('does not modify existing records', () => {
    useProgressStore.getState().recordCompletion({
      levelId: 'lvl_0',
      moves: 10,
      time: 1000,
      stars: 3,
      hintsUsed: 0,
    });
    const recordsBefore = useProgressStore.getState().records;

    useProgressStore.getState().unlockAllWorlds();

    expect(useProgressStore.getState().records).toEqual(recordsBefore);
  });

  it('is idempotent on repeated calls', () => {
    useProgressStore.getState().unlockAllWorlds();
    const first = useProgressStore.getState().unlockedWorldIds;

    useProgressStore.getState().unlockAllWorlds();

    expect(useProgressStore.getState().unlockedWorldIds.sort()).toEqual([...first].sort());
  });
});

describe('computeStars', () => {
  it('awards three stars within 1.3x of optimal', () => {
    expect(computeStars(13, 10)).toBe(3);
  });

  it('awards two stars within 2x of optimal', () => {
    expect(computeStars(20, 10)).toBe(2);
  });

  it('awards one star beyond 2x of optimal', () => {
    expect(computeStars(21, 10)).toBe(1);
  });

  it('falls back to one star when optimal is unknown', () => {
    expect(computeStars(50, undefined)).toBe(1);
  });
});
