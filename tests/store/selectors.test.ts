import { worldProgress } from '../../src/store/selectors';
import { WORLDS } from '../../src/data/worlds';
import { getLevelsForWorld } from '../../src/data/levels';
import type { PuzzleRecord, Stars } from '../../src/store/progressStore';

const natur = WORLDS.find((w) => w.id === 'natur')!;

function record(levelId: string, stars: Stars): PuzzleRecord {
  return {
    levelId,
    completions: 1,
    bestMoves: 10,
    bestTime: 1000,
    stars,
    lastPlayedAt: '2026-01-01T00:00:00.000Z',
    hintsUsedTotal: 0,
  };
}

describe('worldProgress', () => {
  it('reports zero solved for a world with no records', () => {
    const result = worldProgress({}, natur);

    expect(result.solvedCount).toBe(0);
    expect(result.earnedStars).toBe(0);
    expect(result.totalLevels).toBe(getLevelsForWorld('natur').length);
    expect(result.maxStars).toBe(getLevelsForWorld('natur').length * 3);
  });

  it('counts only levels with at least one star as solved', () => {
    const levels = getLevelsForWorld('natur');
    const records: Record<string, PuzzleRecord> = {
      [levels[0]!.id]: record(levels[0]!.id, 3),
      [levels[1]!.id]: record(levels[1]!.id, 1),
    };

    const result = worldProgress(records, natur);

    expect(result.solvedCount).toBe(2);
    expect(result.earnedStars).toBe(4);
  });

  it('reports full progress when every level is three-starred', () => {
    const levels = getLevelsForWorld('natur');
    const records: Record<string, PuzzleRecord> = {};
    for (const level of levels) records[level.id] = record(level.id, 3);

    const result = worldProgress(records, natur);

    expect(result.solvedCount).toBe(levels.length);
    expect(result.earnedStars).toBe(result.maxStars);
  });
});
