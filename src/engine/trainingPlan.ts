import { PuzzleState, Move, applyMove, isSolved, getAdjacentIndices } from './puzzle';

// The training mode teaches the classic *row-by-row* hand-solving schema, not the
// move-optimal machine solution. An optimal solver minimises total moves and freely
// jumps between regions, which reads as chaos to a learner. Instead we solve the
// puzzle in fixed pedagogical *stages* — top row, then the next region, ... , then the
// final block — so every move belongs to one clearly-narratable objective.
//
// Each stage is a partial goal: a set of (position → required tileId) constraints. We
// reach it with a breadth-first search that only ever touches the still-free tiles,
// which keeps already-placed regions intact. BFS over the small states reachable for a
// shallow teaching scramble is fast and, crucially, deterministic — the same start
// always yields the same lesson.

export type TrainingPhaseKind = 'topRow' | 'secondRow' | 'leftColumn' | 'finalBlock';

export type TrainingPhase = {
  kind: TrainingPhaseKind;
  moves: Move[];
};

export type TrainingPlan = {
  phases: TrainingPhase[];
  totalMoves: number;
};

type StageGoal = {
  kind: TrainingPhaseKind;
  // position → required tileId at that position once the stage is complete.
  constraints: readonly (readonly [number, number])[];
};

export class UnsolvableTrainingStateError extends Error {
  constructor(kind: TrainingPhaseKind) {
    super(`Training stage "${kind}" has no solution within the search bound`);
    this.name = 'UnsolvableTrainingStateError';
  }
}

// Safety valve: a shallow teaching scramble resolves each stage in well under this many
// expanded states. If a stage ever exceeds it the lesson data is malformed, so we fail
// loudly rather than hang.
const STAGE_STATE_CAP = 500_000;

function goalConstraints(
  size: number,
  kind: TrainingPhaseKind,
): readonly (readonly [number, number])[] {
  const solvedTileAt = (pos: number): number => (pos === size * size - 1 ? 0 : pos + 1);
  const range = (from: number, to: number): (readonly [number, number])[] => {
    const out: (readonly [number, number])[] = [];
    for (let p = from; p <= to; p++) out.push([p, solvedTileAt(p)] as const);
    return out;
  };

  switch (kind) {
    case 'topRow':
      return range(0, size - 1);
    case 'secondRow':
      return [...range(0, size - 1), ...range(size, 2 * size - 1)];
    case 'leftColumn': {
      // First column of the rows below the solved second row, top to bottom.
      const placed: (readonly [number, number])[] = [...range(0, 2 * size - 1)];
      for (let row = 2; row < size; row++) {
        const pos = row * size;
        placed.push([pos, solvedTileAt(pos)] as const);
      }
      return placed;
    }
    case 'finalBlock':
      return range(0, size * size - 1);
  }
}

function stageGoalsFor(size: number): StageGoal[] {
  const kinds: TrainingPhaseKind[] =
    size <= 3
      ? ['topRow', 'leftColumn', 'finalBlock']
      : ['topRow', 'secondRow', 'leftColumn', 'finalBlock'];
  return kinds.map((kind) => ({ kind, constraints: goalConstraints(size, kind) }));
}

function satisfies(state: PuzzleState, constraints: StageGoal['constraints']): boolean {
  for (const [pos, tileId] of constraints) {
    if (state.tiles[pos] !== tileId) return false;
  }
  return true;
}

function stateKey(state: PuzzleState): string {
  return state.tiles.join(',');
}

// Shortest move sequence (breadth-first) that takes `start` to a state satisfying every
// constraint. Returns [] if already satisfied, throws if the cap is exceeded.
function solveStage(start: PuzzleState, goal: StageGoal): Move[] {
  if (satisfies(start, goal.constraints)) return [];

  type Node = { state: PuzzleState; path: Move[] };
  const queue: Node[] = [{ state: start, path: [] }];
  const seen = new Set<string>([stateKey(start)]);
  let expanded = 0;

  while (queue.length > 0) {
    const node = queue.shift() as Node;
    if (++expanded > STAGE_STATE_CAP) throw new UnsolvableTrainingStateError(goal.kind);

    for (const tileIndex of getAdjacentIndices(node.state.blankIndex, node.state.size)) {
      const next = applyMove(node.state, tileIndex);
      const key = stateKey(next);
      if (seen.has(key)) continue;
      seen.add(key);

      const move: Move = { from: tileIndex, to: node.state.blankIndex };
      const path = [...node.path, move];
      if (satisfies(next, goal.constraints)) return path;
      queue.push({ state: next, path });
    }
  }
  throw new UnsolvableTrainingStateError(goal.kind);
}

// Builds the full row-by-row lesson for a starting arrangement: an ordered list of
// phases, each with the moves that accomplish that phase's objective. Applying every
// move in order leaves the puzzle solved.
export function buildTrainingPlan(start: PuzzleState): TrainingPlan {
  const phases: TrainingPhase[] = [];
  let state = start;
  let totalMoves = 0;

  for (const goal of stageGoalsFor(start.size)) {
    const moves = solveStage(state, goal);
    for (const move of moves) state = applyMove(state, move.from);
    phases.push({ kind: goal.kind, moves });
    totalMoves += moves.length;
  }

  return { phases, totalMoves };
}

// Flattens a plan into the raw move sequence, in lesson order.
export function planMoves(plan: TrainingPlan): Move[] {
  return plan.phases.flatMap((phase) => phase.moves);
}

// True when applying the plan's moves to `start` reaches the solved arrangement. Used
// by tests to guard that baked lesson data stays valid.
export function planSolves(start: PuzzleState, plan: TrainingPlan): boolean {
  let state = start;
  for (const move of planMoves(plan)) {
    state = applyMove(state, move.from);
  }
  return isSolved(state);
}
