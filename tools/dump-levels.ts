// Dumps every fixed-seed level's shuffled start state plus, for pattern levels,
// the tile→group mapping that defines a valid color-group solution. The Python
// precompute solver consumes this JSON so it never re-implements the PRNG, the
// shuffle, or the pattern-shape math — the TS engine stays the single source of
// truth. Run: npx tsx tools/dump-levels.ts > tools/levels-dump.json
import { LEVELS } from '../src/data/levels';
import { shuffleFromSeed } from '../src/engine/shuffle';
import { derivePatternTiles, buildTileGroupMap } from '../src/engine/patterns';

type Dumped = {
  id: string;
  gridSize: number;
  shuffleDepth: string;
  tiles: number[];
  isPattern: boolean;
  // For pattern levels: tileId → groupId. Tiles sharing a group are interchangeable.
  tileGroups?: Record<number, string>;
};

const dump: Dumped[] = LEVELS.map((level) => {
  const state = shuffleFromSeed(level.gridSize, level.shuffleDepth, level.shuffleSeed);
  const base: Dumped = {
    id: level.id,
    gridSize: level.gridSize,
    shuffleDepth: level.shuffleDepth,
    tiles: state.tiles,
    isPattern: level.source.kind === 'pattern',
  };
  if (level.source.kind === 'pattern') {
    const map = buildTileGroupMap(derivePatternTiles(level.source.pattern, level.gridSize));
    base.tileGroups = Object.fromEntries(map);
  }
  return base;
});

process.stdout.write(JSON.stringify(dump, null, 2));
