import { PuzzleState } from './puzzle';

function countInversions(tiles: number[]): number {
  let inversions = 0;
  for (let i = 0; i < tiles.length - 1; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const a = tiles[i] ?? 0;
      const b = tiles[j] ?? 0;
      if (a !== 0 && b !== 0 && a > b) inversions++;
    }
  }
  return inversions;
}

export function isSolvable(state: PuzzleState): boolean {
  const { tiles, size, blankIndex } = state;
  const inversions = countInversions(tiles);
  if (size % 2 === 1) {
    return inversions % 2 === 0;
  }
  // For even grids: solvable iff (inversions + blank_row_from_bottom) is odd.
  // Blank row from bottom is 1-indexed. Goal state has blank at bottom → row 1 from bottom.
  // Goal parity = (0 + 1) = 1 (odd), so any state matching odd parity is solvable.
  const blankRowFromBottom = size - Math.floor(blankIndex / size);
  return (inversions + blankRowFromBottom) % 2 === 1;
}

export function ensureSolvable(state: PuzzleState): PuzzleState {
  if (isSolvable(state)) return state;
  const tiles = [...state.tiles];
  // Swap first two non-blank tiles to flip parity
  let first = -1;
  let second = -1;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] !== 0) {
      if (first === -1) first = i;
      else {
        second = i;
        break;
      }
    }
  }
  if (first !== -1 && second !== -1) {
    const tmp = tiles[first]!;
    tiles[first] = tiles[second]!;
    tiles[second] = tmp;
  }
  return { ...state, tiles };
}
