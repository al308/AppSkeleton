import { levelRequiresExactOrder, effectiveOptimalMoves, type Level } from '../../src/data/levels';

const fillPattern: Level = {
  id: 'test-fill',
  world: 'test',
  title: 'Fill',
  gridSize: 3,
  source: { kind: 'pattern', pattern: { shape: 'stripes_h', colorCount: 2, palette: 'warm' } },
  shuffleDepth: 'relaxed',
  shuffleSeed: 1,
  optimalMoves: 20,
  optimalMovesPattern: 12,
  hintsAllowed: 3,
};

const numberStylePattern: Level = {
  ...fillPattern,
  id: 'test-number-style',
  source: {
    kind: 'pattern',
    pattern: { shape: 'stripes_h', colorCount: 2, palette: 'warm', style: 'number' },
  },
};

const imageLevel: Level = {
  id: 'test-image',
  world: 'test',
  title: 'Image',
  gridSize: 3,
  source: { kind: 'image', asset: 'natur/vulkan' },
  shuffleDepth: 'relaxed',
  shuffleSeed: 1,
  optimalMoves: 18,
  hintsAllowed: 3,
};

describe('levelRequiresExactOrder', () => {
  it('requires exact order for a fill pattern when the numbers setting is on', () => {
    expect(levelRequiresExactOrder(fillPattern, true)).toBe(true);
  });

  it('allows color-group solving for a fill pattern when numbers are off', () => {
    expect(levelRequiresExactOrder(fillPattern, false)).toBe(false);
  });

  it('always requires exact order for a style:number pattern, even with the setting off', () => {
    expect(levelRequiresExactOrder(numberStylePattern, false)).toBe(true);
  });

  it('always requires exact order for image levels (no color groups)', () => {
    expect(levelRequiresExactOrder(imageLevel, false)).toBe(true);
  });
});

describe('effectiveOptimalMoves', () => {
  it('uses the numeric optimal when numbers are shown', () => {
    expect(effectiveOptimalMoves(fillPattern, true)).toBe(20);
  });

  it('uses the color-group optimal when numbers are hidden', () => {
    expect(effectiveOptimalMoves(fillPattern, false)).toBe(12);
  });

  it('falls back to the numeric optimal when no pattern optimal is baked', () => {
    const { optimalMovesPattern: _omit, ...noPatternOpt } = fillPattern;
    expect(effectiveOptimalMoves(noPatternOpt, false)).toBe(20);
  });

  it('uses the numeric optimal for a style:number pattern regardless of setting', () => {
    expect(effectiveOptimalMoves(numberStylePattern, false)).toBe(20);
  });
});
