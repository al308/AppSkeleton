import {
  computeBoardSize,
  computeTileSize,
  BOARD_MAX_SIZE,
  BOARD_MAX_SIZE_TABLET,
} from '../../src/constants/layout';

const TOP_BAR_RESERVE = 64;
const HUD_RESERVE = 96;

// Representative viewports in CSS points, [width, height].
const DEVICES: { name: string; width: number; height: number }[] = [
  { name: 'iPhone SE portrait', width: 375, height: 667 },
  { name: 'iPhone SE landscape', width: 667, height: 375 },
  { name: 'iPhone 14 portrait', width: 390, height: 844 },
  { name: 'iPhone 14 landscape', width: 844, height: 390 },
  { name: 'iPad 10.9 portrait', width: 820, height: 1180 },
  { name: 'iPad 10.9 landscape', width: 1180, height: 820 },
  { name: 'iPad mini landscape', width: 1133, height: 744 },
];

describe('computeBoardSize', () => {
  it.each(DEVICES)('fits the board within the screen on $name', ({ width, height }) => {
    const board = computeBoardSize(width, height);
    const isLandscape = width > height;

    const verticalChrome = TOP_BAR_RESERVE + (isLandscape ? 0 : HUD_RESERVE);
    const horizontalNeed = isLandscape ? board + HUD_RESERVE : board;

    expect(board + verticalChrome).toBeLessThanOrEqual(height);
    expect(horizontalNeed).toBeLessThanOrEqual(width + 1);
  });

  it.each(DEVICES)('keeps the board comfortably playable on $name', ({ width, height }) => {
    const board = computeBoardSize(width, height);

    expect(board).toBeGreaterThanOrEqual(280);
  });

  it('caps at the tablet maximum on a large tablet screen', () => {
    // 1366×1024 — short side 1024 ≥ tablet threshold, so the roomier cap applies.
    expect(computeBoardSize(1366, 1024)).toBe(BOARD_MAX_SIZE_TABLET);
  });

  it('caps at the phone maximum on a phone-class screen', () => {
    // A tall, narrow phone whose budgets exceed the phone cap stays at it.
    expect(computeBoardSize(600, 1200)).toBe(BOARD_MAX_SIZE);
  });
});

describe('computeTileSize', () => {
  it('divides the board into gridSize tiles accounting for gaps', () => {
    const board = 350;
    const grid = 4;

    const tile = computeTileSize(board, grid);

    // Four tiles plus three 2px gaps must reconstruct the board width.
    expect(tile * grid + 2 * (grid - 1)).toBeCloseTo(board);
  });
});
