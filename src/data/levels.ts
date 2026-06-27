import type { ImageAssetKey } from './images';
import { PatternDefinition } from '../engine/patterns';
import { ShuffleDepth } from '../engine/shuffle';

export type GridSize = 3 | 4 | 5 | 6 | 7;

type ImageSource = { kind: 'image'; asset: ImageAssetKey };
type PatternSource = { kind: 'pattern'; pattern: PatternDefinition };

export type Level = {
  id: string;
  world: string;
  title: string;
  gridSize: GridSize;
  source: ImageSource | PatternSource;
  shuffleDepth: ShuffleDepth;
  shuffleSeed: number;
  optimalMoves?: number; // exact numeric solve (strict order)
  optimalMovesPattern?: number; // shortest path to any valid color-group goal (pattern levels)
  optimalApprox?: boolean; // true if optimalMoves is a proven lower bound, not exact
  timeLimitSeconds?: number;
  hintsAllowed: number;
};

const img = (world: string, name: string): ImageSource => ({
  kind: 'image',
  asset: `${world}/${name}` as ImageAssetKey,
});

export const LEVELS: Level[] = [
  // ── Natur (World 1) ──────────────────────────────────────────
  {
    id: 'natur_01',
    world: 'natur',
    title: 'Löwe',
    gridSize: 3,
    source: img('natur', 'lion'),
    shuffleDepth: 'relaxed',
    shuffleSeed: 1001,
    optimalMoves: 20,
    hintsAllowed: 5,
  },
  {
    id: 'natur_02',
    world: 'natur',
    title: 'Schwäne',
    gridSize: 3,
    source: img('natur', 'swans'),
    shuffleDepth: 'normal',
    shuffleSeed: 1002,
    optimalMoves: 19,
    hintsAllowed: 4,
  },
  {
    id: 'natur_03',
    world: 'natur',
    title: 'Kätzchen',
    gridSize: 3,
    source: img('natur', 'kitten'),
    shuffleDepth: 'normal',
    shuffleSeed: 1003,
    optimalMoves: 21,
    hintsAllowed: 4,
  },
  {
    id: 'natur_04',
    world: 'natur',
    title: 'Löwe · Mittel',
    gridSize: 4,
    source: img('natur', 'lion'),
    shuffleDepth: 'relaxed',
    shuffleSeed: 1004,
    optimalMoves: 20,
    hintsAllowed: 4,
  },
  {
    id: 'natur_05',
    world: 'natur',
    title: 'Schwäne · Mittel',
    gridSize: 4,
    source: img('natur', 'swans'),
    shuffleDepth: 'normal',
    shuffleSeed: 1005,
    optimalMoves: 41,
    hintsAllowed: 3,
  },
  {
    id: 'natur_06',
    world: 'natur',
    title: 'Kätzchen · Mittel',
    gridSize: 4,
    source: img('natur', 'kitten'),
    shuffleDepth: 'normal',
    shuffleSeed: 1006,
    optimalMoves: 41,
    hintsAllowed: 3,
  },
  {
    id: 'natur_07',
    world: 'natur',
    title: 'Löwe · Schwer',
    gridSize: 5,
    source: img('natur', 'lion'),
    shuffleDepth: 'relaxed',
    shuffleSeed: 1009,
    optimalMoves: 20,
    hintsAllowed: 3,
  },
  {
    id: 'natur_08',
    world: 'natur',
    title: 'Schwäne · Schwer',
    gridSize: 5,
    source: img('natur', 'swans'),
    shuffleDepth: 'normal',
    shuffleSeed: 1010,
    optimalMoves: 41,
    optimalApprox: true,
    hintsAllowed: 3,
  },
  {
    id: 'natur_09',
    world: 'natur',
    title: 'Kätzchen · Schwer',
    gridSize: 5,
    source: img('natur', 'kitten'),
    shuffleDepth: 'normal',
    shuffleSeed: 1011,
    optimalMoves: 43,
    hintsAllowed: 2,
  },

  // ── Muster (World 2) ──────────────────────────────────────────
  {
    id: 'muster_01',
    world: 'muster',
    title: 'Streifen · Warm',
    gridSize: 3,
    source: { kind: 'pattern', pattern: { shape: 'stripes_h', colorCount: 2, palette: 'warm' } },
    shuffleDepth: 'relaxed',
    shuffleSeed: 2001,
    optimalMoves: 18,
    optimalMovesPattern: 12,
    hintsAllowed: 5,
  },
  {
    id: 'muster_02',
    world: 'muster',
    title: 'Schachbrett · Klassik',
    gridSize: 3,
    source: { kind: 'pattern', pattern: { shape: 'checker', colorCount: 2, palette: 'mono' } },
    shuffleDepth: 'normal',
    shuffleSeed: 2002,
    optimalMoves: 23,
    optimalMovesPattern: 9,
    hintsAllowed: 4,
  },
  {
    id: 'muster_03',
    world: 'muster',
    title: 'Diamant · Kalt',
    gridSize: 3,
    source: { kind: 'pattern', pattern: { shape: 'diamond', colorCount: 3, palette: 'cool' } },
    shuffleDepth: 'normal',
    shuffleSeed: 2003,
    optimalMoves: 23,
    optimalMovesPattern: 9,
    hintsAllowed: 4,
  },
  {
    id: 'muster_04',
    world: 'muster',
    title: 'Farbverlauf · Neon',
    gridSize: 4,
    source: { kind: 'pattern', pattern: { shape: 'gradient_h', colorCount: 4, palette: 'neon' } },
    shuffleDepth: 'relaxed',
    shuffleSeed: 2004,
    optimalMoves: 20,
    optimalMovesPattern: 17,
    hintsAllowed: 4,
  },
  {
    id: 'muster_05',
    world: 'muster',
    title: 'Konzentrische Quadrate',
    gridSize: 4,
    source: {
      kind: 'pattern',
      pattern: { shape: 'nested_squares', colorCount: 3, palette: 'earth' },
    },
    shuffleDepth: 'normal',
    shuffleSeed: 2005,
    optimalMoves: 45,
    optimalMovesPattern: 17,
    hintsAllowed: 3,
  },
  {
    id: 'muster_06',
    world: 'muster',
    title: 'Stern · Warm',
    gridSize: 4,
    source: { kind: 'pattern', pattern: { shape: 'star', colorCount: 3, palette: 'warm' } },
    shuffleDepth: 'normal',
    shuffleSeed: 2006,
    optimalMoves: 39,
    optimalMovesPattern: 15,
    hintsAllowed: 3,
  },
  {
    id: 'muster_07',
    world: 'muster',
    title: 'Streifen · 4 Farben',
    gridSize: 4,
    source: { kind: 'pattern', pattern: { shape: 'stripes_v', colorCount: 4, palette: 'cool' } },
    shuffleDepth: 'hard',
    shuffleSeed: 2007,
    optimalMoves: 48,
    optimalMovesPattern: 16,
    hintsAllowed: 3,
  },
  {
    id: 'muster_08',
    world: 'muster',
    title: 'Diagonale · Erde',
    gridSize: 4,
    source: { kind: 'pattern', pattern: { shape: 'stripes_d', colorCount: 4, palette: 'earth' } },
    shuffleDepth: 'hard',
    shuffleSeed: 2008,
    optimalMoves: 32,
    optimalMovesPattern: 24,
    optimalApprox: true,
    hintsAllowed: 3,
  },
  {
    id: 'muster_09',
    world: 'muster',
    title: 'Farbverlauf Radial · 5×5',
    gridSize: 5,
    source: { kind: 'pattern', pattern: { shape: 'gradient_r', colorCount: 4, palette: 'mono' } },
    shuffleDepth: 'relaxed',
    shuffleSeed: 2009,
    optimalMoves: 20,
    optimalMovesPattern: 15,
    hintsAllowed: 3,
  },
  {
    id: 'muster_10',
    world: 'muster',
    title: 'Schachbrett Groß · Neon',
    gridSize: 5,
    source: {
      kind: 'pattern',
      pattern: { shape: 'checker_large', colorCount: 4, palette: 'neon' },
    },
    shuffleDepth: 'normal',
    shuffleSeed: 2010,
    optimalMoves: 37,
    optimalMovesPattern: 23,
    optimalApprox: true,
    hintsAllowed: 3,
  },
  {
    id: 'muster_11',
    world: 'muster',
    title: 'Stern · 6 Farben',
    gridSize: 5,
    source: { kind: 'pattern', pattern: { shape: 'star', colorCount: 3, palette: 'neon' } },
    shuffleDepth: 'normal',
    shuffleSeed: 2011,
    optimalMoves: 37,
    optimalMovesPattern: 15,
    optimalApprox: true,
    hintsAllowed: 2,
  },
  {
    id: 'muster_12',
    world: 'muster',
    title: 'Diamant · Meister',
    gridSize: 5,
    source: { kind: 'pattern', pattern: { shape: 'diamond', colorCount: 5, palette: 'cool' } },
    shuffleDepth: 'hard',
    shuffleSeed: 2012,
    optimalMoves: 58,
    optimalMovesPattern: 28,
    optimalApprox: true,
    hintsAllowed: 2,
  },
  {
    id: 'muster_13',
    world: 'muster',
    title: 'Wellen · Kalt',
    gridSize: 4,
    source: { kind: 'pattern', pattern: { shape: 'waves', colorCount: 4, palette: 'cool' } },
    shuffleDepth: 'normal',
    shuffleSeed: 2013,
    optimalMoves: 41,
    optimalMovesPattern: 25,
    hintsAllowed: 3,
  },
  {
    id: 'muster_14',
    world: 'muster',
    title: 'Diagonale Linien · Erde',
    gridSize: 4,
    source: {
      kind: 'pattern',
      pattern: { shape: 'triangles', colorCount: 3, palette: 'earth', glyph: 'lines_d' },
    },
    shuffleDepth: 'hard',
    shuffleSeed: 2014,
    optimalMoves: 42,
    optimalMovesPattern: 20,
    optimalApprox: true,
    hintsAllowed: 3,
  },
  {
    id: 'muster_15',
    world: 'muster',
    title: 'Zahlen · Klassik',
    gridSize: 4,
    source: {
      kind: 'pattern',
      pattern: { shape: 'bordered_stripes', colorCount: 4, palette: 'mono', style: 'number' },
    },
    shuffleDepth: 'normal',
    shuffleSeed: 2015,
    optimalMoves: 43,
    optimalMovesPattern: 22,
    hintsAllowed: 3,
  },

  // ── Glyphen (World 3) ────────────────────────────────────────
  {
    id: 'glyphen_01',
    world: 'glyphen',
    title: 'Horizontale Linien',
    gridSize: 3,
    source: {
      kind: 'pattern',
      pattern: { shape: 'stripes_h', colorCount: 2, palette: 'cool', glyph: 'lines_h' },
    },
    shuffleDepth: 'relaxed',
    shuffleSeed: 2101,
    optimalMoves: 20,
    optimalMovesPattern: 8,
    hintsAllowed: 5,
  },
  {
    id: 'glyphen_02',
    world: 'glyphen',
    title: 'Vertikale Linien',
    gridSize: 3,
    source: {
      kind: 'pattern',
      pattern: { shape: 'stripes_v', colorCount: 2, palette: 'warm', glyph: 'lines_v' },
    },
    shuffleDepth: 'relaxed',
    shuffleSeed: 2102,
    optimalMoves: 18,
    optimalMovesPattern: 6,
    hintsAllowed: 5,
  },
  {
    id: 'glyphen_03',
    world: 'glyphen',
    title: 'Zahlen · 3×3',
    gridSize: 3,
    source: {
      kind: 'pattern',
      pattern: { shape: 'gradient_h', colorCount: 3, palette: 'mono', style: 'number' },
    },
    shuffleDepth: 'normal',
    shuffleSeed: 2103,
    optimalMoves: 21,
    optimalMovesPattern: 12,
    hintsAllowed: 4,
  },
  {
    id: 'glyphen_04',
    world: 'glyphen',
    title: 'Wellen · Kalt',
    gridSize: 4,
    source: { kind: 'pattern', pattern: { shape: 'waves', colorCount: 4, palette: 'cool' } },
    shuffleDepth: 'normal',
    shuffleSeed: 2104,
    optimalMoves: 35,
    optimalMovesPattern: 25,
    hintsAllowed: 4,
  },
  {
    id: 'glyphen_05',
    world: 'glyphen',
    title: 'Diagonale Linien',
    gridSize: 4,
    source: {
      kind: 'pattern',
      pattern: { shape: 'gradient_r', colorCount: 4, palette: 'neon', glyph: 'lines_d' },
    },
    shuffleDepth: 'normal',
    shuffleSeed: 2105,
    optimalMoves: 25,
    optimalMovesPattern: 16,
    hintsAllowed: 4,
  },
  {
    id: 'glyphen_06',
    world: 'glyphen',
    title: 'Dreiecke · Erde',
    gridSize: 4,
    source: { kind: 'pattern', pattern: { shape: 'triangles', colorCount: 3, palette: 'earth' } },
    shuffleDepth: 'normal',
    shuffleSeed: 2106,
    optimalMoves: 37,
    optimalMovesPattern: 26,
    hintsAllowed: 3,
  },
  {
    id: 'glyphen_07',
    world: 'glyphen',
    title: 'Gitter · Mono',
    gridSize: 4,
    source: {
      kind: 'pattern',
      pattern: { shape: 'checker', colorCount: 2, palette: 'mono', glyph: 'grid' },
    },
    shuffleDepth: 'hard',
    shuffleSeed: 2107,
    optimalMoves: 30,
    optimalMovesPattern: 10,
    hintsAllowed: 3,
  },
  {
    id: 'glyphen_08',
    world: 'glyphen',
    title: 'Gerahmte Streifen',
    gridSize: 4,
    source: {
      kind: 'pattern',
      pattern: { shape: 'bordered_stripes', colorCount: 4, palette: 'warm' },
    },
    shuffleDepth: 'hard',
    shuffleSeed: 2108,
    optimalMoves: 44,
    optimalMovesPattern: 21,
    optimalApprox: true,
    hintsAllowed: 3,
  },
  {
    id: 'glyphen_09',
    world: 'glyphen',
    title: 'Zahlen · 4×4',
    gridSize: 4,
    source: {
      kind: 'pattern',
      pattern: { shape: 'gradient_v', colorCount: 4, palette: 'cool', style: 'number' },
    },
    shuffleDepth: 'hard',
    shuffleSeed: 2109,
    optimalMoves: 52,
    optimalMovesPattern: 20,
    hintsAllowed: 3,
  },
  {
    id: 'glyphen_10',
    world: 'glyphen',
    title: 'Wellen · Meister',
    gridSize: 5,
    source: { kind: 'pattern', pattern: { shape: 'waves', colorCount: 5, palette: 'neon' } },
    shuffleDepth: 'hard',
    shuffleSeed: 2110,
    optimalMoves: 48,
    optimalMovesPattern: 29,
    optimalApprox: true,
    hintsAllowed: 2,
  },
  {
    id: 'glyphen_11',
    world: 'glyphen',
    title: 'Gegendiagonale Linien',
    gridSize: 5,
    source: {
      kind: 'pattern',
      pattern: { shape: 'stripes_d2', colorCount: 4, palette: 'earth', glyph: 'lines_d2' },
    },
    shuffleDepth: 'hard',
    shuffleSeed: 2111,
    optimalMoves: 60,
    optimalMovesPattern: 31,
    optimalApprox: true,
    hintsAllowed: 2,
  },
  {
    id: 'glyphen_12',
    world: 'glyphen',
    title: 'Dreiecke · Meister',
    gridSize: 5,
    source: { kind: 'pattern', pattern: { shape: 'triangles', colorCount: 5, palette: 'cool' } },
    shuffleDepth: 'hard',
    shuffleSeed: 2112,
    optimalMoves: 50,
    optimalMovesPattern: 20,
    optimalApprox: true,
    hintsAllowed: 2,
  },
];

export function getLevelsForWorld(worldId: string): Level[] {
  return LEVELS.filter((l) => l.world === worldId);
}

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

// Whether the puzzle is only solved in exact numeric order (no color-group
// leniency). Image levels have no color groups, so they are always strict.
// Pattern levels are strict when numbers are shown — the global setting is on,
// or the pattern bakes numbers into its tiles (style: 'number').
// See docs/specs/numbered-solving.md.
export function levelRequiresExactOrder(level: Level, tileNumbersVisible: boolean): boolean {
  if (level.source.kind === 'image') return true;
  if (tileNumbersVisible) return true;
  return level.source.pattern.style === 'number';
}

// The optimal-move count to use for star rating, matching the active mode:
// numeric goal when numbers are shown, color-group goal otherwise.
export function effectiveOptimalMoves(
  level: Level,
  tileNumbersVisible: boolean,
): number | undefined {
  if (levelRequiresExactOrder(level, tileNumbersVisible)) return level.optimalMoves;
  return level.optimalMovesPattern ?? level.optimalMoves;
}

export function getNextLevel(currentId: string): Level | undefined {
  const idx = LEVELS.findIndex((l) => l.id === currentId);
  if (idx === -1 || idx === LEVELS.length - 1) return undefined;
  return LEVELS[idx + 1];
}
