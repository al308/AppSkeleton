export type PuzzleState = {
  tiles: number[];
  size: number;
  blankIndex: number;
};

export type Move = {
  from: number;
  to: number;
};

export function createSolvedState(size: number): PuzzleState {
  const total = size * size;
  const tiles = Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));
  return { tiles, size, blankIndex: total - 1 };
}

export function getAdjacentIndices(blankIndex: number, size: number): number[] {
  const row = Math.floor(blankIndex / size);
  const col = blankIndex % size;
  const adjacent: number[] = [];
  if (row > 0) adjacent.push(blankIndex - size);
  if (row < size - 1) adjacent.push(blankIndex + size);
  if (col > 0) adjacent.push(blankIndex - 1);
  if (col < size - 1) adjacent.push(blankIndex + 1);
  return adjacent;
}

export function isValidMove(state: PuzzleState, tileIndex: number): boolean {
  return getAdjacentIndices(state.blankIndex, state.size).includes(tileIndex);
}

export function applyMove(state: PuzzleState, tileIndex: number): PuzzleState {
  const tiles = [...state.tiles];
  tiles[state.blankIndex] = tiles[tileIndex] ?? 0;
  tiles[tileIndex] = 0;
  return { tiles, size: state.size, blankIndex: tileIndex };
}

export function isSolved(state: PuzzleState, tileGroups?: TileGroupMap): boolean {
  const { tiles, size } = state;
  const total = size * size;
  if (tileGroups) {
    return isPatternSolved(tiles, total, tileGroups);
  }
  for (let i = 0; i < total - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[total - 1] === 0;
}

export type TileGroupMap = Map<number, string>;

function isPatternSolved(tiles: number[], total: number, tileGroups: TileGroupMap): boolean {
  const goalGroupAtPosition = (pos: number): string => {
    const goalTileId = pos === total - 1 ? 0 : pos + 1;
    return tileGroups.get(goalTileId) ?? String(goalTileId);
  };
  for (let pos = 0; pos < total; pos++) {
    const tileId = tiles[pos] ?? 0;
    const tileGroup = tileGroups.get(tileId) ?? String(tileId);
    const goalGroup = goalGroupAtPosition(pos);
    if (tileGroup !== goalGroup) return false;
  }
  return true;
}

export function manhattanDistance(state: PuzzleState): number {
  const { tiles, size } = state;
  let distance = 0;
  for (let i = 0; i < tiles.length; i++) {
    const tileId = tiles[i] ?? 0;
    if (tileId === 0) continue;
    const goalPos = tileId - 1;
    const curRow = Math.floor(i / size);
    const curCol = i % size;
    const goalRow = Math.floor(goalPos / size);
    const goalCol = goalPos % size;
    distance += Math.abs(curRow - goalRow) + Math.abs(curCol - goalCol);
  }
  return distance;
}

export function cloneState(state: PuzzleState): PuzzleState {
  return { tiles: [...state.tiles], size: state.size, blankIndex: state.blankIndex };
}
