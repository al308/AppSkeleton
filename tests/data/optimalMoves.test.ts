import { LEVELS } from '../../src/data/levels';

describe('baked optimalMoves data', () => {
  it('every fixed-seed level has a numeric optimalMoves', () => {
    const missing = LEVELS.filter(
      (l) => l.shuffleDepth !== 'random' && typeof l.optimalMoves !== 'number',
    ).map((l) => l.id);

    expect(missing).toEqual([]);
  });

  it('pattern levels have a color-group optimal no larger than the numeric one', () => {
    const offenders = LEVELS.filter(
      (l) =>
        l.source.kind === 'pattern' &&
        typeof l.optimalMoves === 'number' &&
        typeof l.optimalMovesPattern === 'number' &&
        l.optimalMovesPattern > l.optimalMoves,
    ).map((l) => `${l.id}: pattern ${l.optimalMovesPattern} > numeric ${l.optimalMoves}`);

    expect(offenders).toEqual([]);
  });

  it('every pattern level has a baked color-group optimal', () => {
    const missing = LEVELS.filter(
      (l) => l.source.kind === 'pattern' && typeof l.optimalMovesPattern !== 'number',
    ).map((l) => l.id);

    expect(missing).toEqual([]);
  });
});
