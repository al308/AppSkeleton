import {
  derivePatternTiles,
  buildTileGroupMap,
  PatternDefinition,
} from '../../src/engine/patterns';

const MVP_SHAPES: PatternDefinition[] = [
  { shape: 'stripes_h', colorCount: 3, palette: 'warm' },
  { shape: 'checker', colorCount: 2, palette: 'cool' },
  { shape: 'nested_squares', colorCount: 3, palette: 'earth' },
  { shape: 'star', colorCount: 3, palette: 'neon' },
  { shape: 'diamond', colorCount: 4, palette: 'mono' },
  { shape: 'gradient_h', colorCount: 4, palette: 'mono' },
];

const NEW_SHAPES: PatternDefinition[] = [
  { shape: 'waves', colorCount: 4, palette: 'cool' },
  { shape: 'triangles', colorCount: 3, palette: 'warm' },
  { shape: 'bordered_stripes', colorCount: 4, palette: 'neon' },
];

describe('derivePatternTiles', () => {
  it('produces gridSize^2 tiles for 4x4', () => {
    for (const def of MVP_SHAPES) {
      const tiles = derivePatternTiles(def, 4);
      expect(tiles).toHaveLength(16);
    }
  });

  it('blank tile (id=0) is included', () => {
    const tiles = derivePatternTiles({ shape: 'checker', colorCount: 2, palette: 'mono' }, 3);
    expect(tiles.some((t) => t.tileId === 0)).toBe(true);
  });

  it('all colors come from at most colorCount groups', () => {
    const def: PatternDefinition = { shape: 'stripes_h', colorCount: 3, palette: 'warm' };
    const tiles = derivePatternTiles(def, 4);
    const groups = new Set(tiles.map((t) => t.groupId));
    expect(groups.size).toBeLessThanOrEqual(3);
  });

  it('each tile has a non-empty color string', () => {
    const tiles = derivePatternTiles({ shape: 'gradient_v', colorCount: 4, palette: 'cool' }, 5);
    for (const t of tiles) {
      expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('new shapes produce a full grid of valid, bounded tiles', () => {
    for (const def of NEW_SHAPES) {
      const tiles = derivePatternTiles(def, 4);
      expect(tiles).toHaveLength(16);
      for (const t of tiles) {
        expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
      }
      const groups = new Set(tiles.map((t) => t.groupId));
      expect(groups.size).toBeLessThanOrEqual(def.colorCount);
    }
  });
});

describe('buildTileGroupMap', () => {
  it('maps every tileId to a groupId', () => {
    const def: PatternDefinition = { shape: 'checker', colorCount: 2, palette: 'mono' };
    const tiles = derivePatternTiles(def, 3);
    const map = buildTileGroupMap(tiles);
    expect(map.size).toBe(9);
    expect(map.has(0)).toBe(true);
    expect(map.has(1)).toBe(true);
  });
});
