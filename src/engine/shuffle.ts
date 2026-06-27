import { PuzzleState, createSolvedState, getAdjacentIndices, applyMove } from './puzzle';

// Mulberry32 — identical algorithm used in tools/precompute_solver.py
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return (): number => {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
  };
}

export type ShuffleDepth = 'relaxed' | 'normal' | 'hard' | 'random';

const DEPTH_MOVES: Record<ShuffleDepth, number> = {
  relaxed: 20,
  normal: 65,
  hard: 150,
  random: 300,
};

export function shuffleFromSeed(size: number, depth: ShuffleDepth, seed: number): PuzzleState {
  const rng = mulberry32(seed);
  let state = createSolvedState(size);
  const moves = DEPTH_MOVES[depth];
  let lastBlank = -1;

  for (let i = 0; i < moves; i++) {
    const adjacent = getAdjacentIndices(state.blankIndex, size).filter((idx) => idx !== lastBlank);
    const pick = adjacent[Math.floor(rng() * adjacent.length)];
    if (pick !== undefined) {
      lastBlank = state.blankIndex;
      state = applyMove(state, pick);
    }
  }
  return state;
}
