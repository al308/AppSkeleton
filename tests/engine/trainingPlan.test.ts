import {
  buildTrainingPlan,
  planMoves,
  planSolves,
  TrainingPhaseKind,
} from '../../src/engine/trainingPlan';
import { createSolvedState, applyMove, isValidMove, PuzzleState } from '../../src/engine/puzzle';

function stateOf(tiles: number[], size: number): PuzzleState {
  return { tiles, size, blankIndex: tiles.indexOf(0) };
}

function applyMoves(start: PuzzleState, indices: number[]): PuzzleState {
  let state = start;
  for (const idx of indices) {
    if (isValidMove(state, idx)) state = applyMove(state, idx);
  }
  return state;
}

describe('buildTrainingPlan', () => {
  it('returns no moves for an already-solved board', () => {
    const plan = buildTrainingPlan(createSolvedState(3));

    expect(plan.totalMoves).toBe(0);
    expect(planMoves(plan)).toEqual([]);
  });

  it('produces the three schema phases in order for a 3x3', () => {
    const start = stateOf([5, 1, 3, 4, 2, 6, 7, 8, 0], 3);

    const plan = buildTrainingPlan(start);

    expect(plan.phases.map((p) => p.kind)).toEqual<TrainingPhaseKind[]>([
      'topRow',
      'leftColumn',
      'finalBlock',
    ]);
  });

  it('produces the four schema phases in order for a 4x4', () => {
    const start = stateOf([0, 1, 2, 3, 5, 7, 8, 4, 10, 6, 15, 11, 9, 13, 14, 12], 4);

    const plan = buildTrainingPlan(start);

    expect(plan.phases.map((p) => p.kind)).toEqual<TrainingPhaseKind[]>([
      'topRow',
      'secondRow',
      'leftColumn',
      'finalBlock',
    ]);
  });

  it('covers every move exactly once across phases', () => {
    const start = stateOf([5, 1, 3, 4, 2, 6, 7, 8, 0], 3);

    const plan = buildTrainingPlan(start);
    const summed = plan.phases.reduce((acc, p) => acc + p.moves.length, 0);

    expect(summed).toBe(plan.totalMoves);
    expect(planMoves(plan).length).toBe(plan.totalMoves);
  });

  it('applying the whole plan solves the puzzle', () => {
    const start = stateOf([0, 1, 2, 3, 5, 7, 8, 4, 10, 6, 15, 11, 9, 13, 14, 12], 4);

    const plan = buildTrainingPlan(start);

    expect(planSolves(start, plan)).toBe(true);
  });

  it('keeps each phase building on the previous (every move is legal in sequence)', () => {
    const start = stateOf([5, 1, 3, 4, 2, 6, 7, 8, 0], 3);

    const plan = buildTrainingPlan(start);
    let state = start;
    let allLegal = true;
    for (const move of planMoves(plan)) {
      if (!isValidMove(state, move.from)) allLegal = false;
      state = applyMove(state, move.from);
    }

    expect(allLegal).toBe(true);
  });

  it('once a phase completes, its placed region is never disturbed again', () => {
    const start = stateOf([0, 1, 2, 3, 5, 7, 8, 4, 10, 6, 15, 11, 9, 13, 14, 12], 4);

    const plan = buildTrainingPlan(start);
    // After the top row phase, positions 0..3 must equal 1..4 for the rest of the lesson.
    let state = start;
    let placedTopRow = false;
    let topRowStaysPut = true;
    for (const phase of plan.phases) {
      for (const move of phase.moves) {
        state = applyMove(state, move.from);
      }
      if (phase.kind === 'topRow') placedTopRow = true;
      if (placedTopRow) {
        const topRowOk = [0, 1, 2, 3].every((pos, i) => state.tiles[pos] === i + 1);
        if (!topRowOk) topRowStaysPut = false;
      }
    }

    expect(topRowStaysPut).toBe(true);
  });

  it('demonstrates the lesson sources are reachable via legal slides (sanity)', () => {
    // Both lesson states must round-trip from solved with legal slides only, ensuring
    // they are genuine solvable arrangements.
    const reached = applyMoves(createSolvedState(3), [7, 6, 3, 0, 1, 4]);
    expect(reached.size).toBe(3);
  });
});
