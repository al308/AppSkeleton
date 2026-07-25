import {
  PuzzleState,
  Move,
  manhattanDistance,
  getAdjacentIndices,
  applyMove,
  isSolved,
} from './puzzle';
import { isSolvable } from './solvability';

const TIME_LIMITS_MS: Record<number, number> = {
  3: Infinity,
  4: 500,
  5: 300,
};

type SearchResult = { found: boolean; moves: Move[]; cancelled: boolean };

function idaStarSearch(
  state: PuzzleState,
  g: number,
  bound: number,
  path: Move[],
  deadline: number,
): SearchResult {
  const h = manhattanDistance(state);
  const f = g + h;
  if (f > bound) return { found: false, moves: [f as unknown as Move], cancelled: false };
  if (h === 0) return { found: true, moves: [...path], cancelled: false };
  if (Date.now() > deadline) return { found: false, moves: [], cancelled: true };

  let min = Infinity;
  const adjacent = getAdjacentIndices(state.blankIndex, state.size);
  const lastMove = path[path.length - 1];

  for (const tileIdx of adjacent) {
    if (lastMove && tileIdx === lastMove.to) continue; // don't undo last move

    const next = applyMove(state, tileIdx);
    const move: Move = { from: tileIdx, to: state.blankIndex };
    path.push(move);

    const result = idaStarSearch(next, g + 1, bound, path, deadline);
    if (result.cancelled) return result;
    if (result.found) return result;

    const t = result.moves[0];
    if (typeof t === 'number' && t < min) min = t;
    path.pop();
  }
  return { found: false, moves: [min as unknown as Move], cancelled: false };
}

export function idaStar(state: PuzzleState): Move[] | null {
  // An unsolvable arrangement never reaches h === 0, so the search would walk
  // every bound up to the cap — exponential work for nothing. Reject it up front.
  if (!isSolvable(state)) return null;

  const limitMs = TIME_LIMITS_MS[state.size] ?? 300;
  const deadline = limitMs === Infinity ? Infinity : Date.now() + limitMs;

  let bound = manhattanDistance(state);
  const path: Move[] = [];

  while (bound < 100) {
    const result = idaStarSearch(state, 0, bound, path, deadline);
    if (result.cancelled) return null;
    if (result.found) return result.moves;
    const next = result.moves[0];
    if (typeof next !== 'number' || next === Infinity) return null;
    bound = next;
  }
  return null;
}

export function greedyNextMove(state: PuzzleState): Move | null {
  const adjacent = getAdjacentIndices(state.blankIndex, state.size);
  let bestMove: Move | null = null;
  let bestH = manhattanDistance(state);

  for (const tileIdx of adjacent) {
    const next = applyMove(state, tileIdx);
    const h = manhattanDistance(next);
    if (h < bestH) {
      bestH = h;
      bestMove = { from: tileIdx, to: state.blankIndex };
    }
  }
  return bestMove;
}

// Grids for which a full optimal solve is fast enough to run on the JS thread
// after every move without a visible hitch. 3x3 solves in well under a frame;
// 4x4 and up can take hundreds of ms when far from solved, so there we fall
// back to the Manhattan-distance lower bound — instant, and never an
// over-estimate, so the displayed number stays honest.
const LIVE_OPTIMAL_MAX_SIZE = 3;

export type RemainingEstimate =
  | { kind: 'exact'; moves: number }
  | { kind: 'atLeast'; moves: number }
  | { kind: 'unknown' };

// How many optimal moves remain from the current arrangement. For small grids
// this is the exact optimal solution length; for larger grids (or when the
// search times out) it degrades to the Manhattan distance, which is a proven
// lower bound — never an over-estimate — so the displayed number stays honest.
//
// Pattern levels are solved when *color groups* match, not exact tile positions,
// so a distance-to-numeric-goal estimate would over-count. For those we return
// `unknown` (caller hides the stat) rather than mislead. Pass the level's
// tileGroupMap to opt into this guard.
export function remainingMoves(state: PuzzleState, isPattern = false): RemainingEstimate {
  if (isPattern) return { kind: 'unknown' };
  if (isSolved(state)) return { kind: 'exact', moves: 0 };

  const lowerBound = manhattanDistance(state);

  if (state.size <= LIVE_OPTIMAL_MAX_SIZE) {
    const path = idaStar(state);
    if (path) return { kind: 'exact', moves: path.length };
  }

  return { kind: 'atLeast', moves: lowerBound };
}

// How close the player is to the goal, for escalating "tension" chrome
// (background/board glow). Only ever nonzero when the remaining-move count is
// known exactly — a Manhattan lower bound can understate the true distance, so
// escalating on `atLeast` could visually promise a finish that isn't close.
export function tensionLevelFor(remaining: RemainingEstimate): 0 | 1 | 2 | 3 {
  if (remaining.kind !== 'exact') return 0;
  if (remaining.moves <= 5) return 3;
  if (remaining.moves <= 10) return 2;
  if (remaining.moves <= 20) return 1;
  return 0;
}

export type HintResult = { type: 'moves'; moves: Move[] } | { type: 'unavailable' };

export function computeHint(state: PuzzleState, steps: 1 | 3): HintResult {
  if (isSolved(state)) return { type: 'unavailable' };

  const fullPath = idaStar(state);

  if (fullPath && fullPath.length > 0) {
    return { type: 'moves', moves: fullPath.slice(0, steps) };
  }

  // Greedy fallback
  const greedyMoves: Move[] = [];
  let cur = state;
  for (let i = 0; i < steps; i++) {
    const move = greedyNextMove(cur);
    if (!move) break;
    greedyMoves.push(move);
    cur = applyMove(cur, move.from);
  }

  if (greedyMoves.length > 0) {
    return { type: 'moves', moves: greedyMoves };
  }
  return { type: 'unavailable' };
}
