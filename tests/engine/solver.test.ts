import {
  idaStar,
  greedyNextMove,
  computeHint,
  remainingMoves,
  tensionLevelFor,
} from '../../src/engine/solver';
import {
  createSolvedState,
  applyMove,
  isSolved,
  isValidMove,
  manhattanDistance,
} from '../../src/engine/puzzle';

jest.setTimeout(30000);

// Applies only *legal* slides (a tile adjacent to the blank), skipping any index
// that isn't currently adjacent. Sliding only ever yields solvable states, so the
// solver can never be handed an unsolvable board that would explode the search.
function makeStateWithMoves(size: number, moves: number[]): ReturnType<typeof createSolvedState> {
  let state = createSolvedState(size);
  for (const idx of moves) {
    if (isValidMove(state, idx)) {
      state = applyMove(state, idx);
    }
  }
  return state;
}

describe('idaStar', () => {
  it('returns empty array for already-solved state', () => {
    const result = idaStar(createSolvedState(3));
    expect(result).toEqual([]);
  });

  it('finds 1-move solution', () => {
    const state = applyMove(createSolvedState(3), 7);
    const moves = idaStar(state);
    expect(moves).not.toBeNull();
    expect(moves!.length).toBe(1);
  });

  it('finds optimal path for simple 3x3 scramble', () => {
    // 2 moves: move tile at 7, then tile at 6
    const state = makeStateWithMoves(3, [7, 6]);
    const moves = idaStar(state);
    expect(moves).not.toBeNull();
    expect(moves!.length).toBeLessThanOrEqual(2);
  });

  it('applying solution moves reaches solved state', () => {
    const state = makeStateWithMoves(3, [7, 5, 4, 3]);
    const moves = idaStar(state);
    expect(moves).not.toBeNull();
    let cur = state;
    for (const move of moves!) {
      cur = applyMove(cur, move.from);
    }
    expect(isSolved(cur)).toBe(true);
  });

  it('returns null at once for an unsolvable arrangement (no search blow-up)', () => {
    // A single transposition of two tiles makes a 3x3 unsolvable.
    const solved = createSolvedState(3);
    const tiles = [...solved.tiles];
    [tiles[0], tiles[1]] = [tiles[1]!, tiles[0]!];
    const unsolvable = { ...solved, tiles };

    const start = Date.now();
    expect(idaStar(unsolvable)).toBeNull();
    expect(Date.now() - start).toBeLessThan(100);
  });
});

describe('remainingMoves', () => {
  it('reports zero exact moves for a solved board', () => {
    expect(remainingMoves(createSolvedState(3))).toEqual({ kind: 'exact', moves: 0 });
  });

  it('reports the exact optimal count on a small grid', () => {
    const state = makeStateWithMoves(3, [7, 6]);

    const result = remainingMoves(state);

    expect(result.kind).toBe('exact');
    if (result.kind !== 'unknown') {
      expect(result.moves).toBeLessThanOrEqual(2);
      expect(result.moves).toBeGreaterThan(0);
    }
  });

  it('never over-estimates: the estimate is at most the true optimal', () => {
    const state = makeStateWithMoves(3, [7, 5, 4, 3]);

    const result = remainingMoves(state);
    const optimal = idaStar(state)!.length;

    expect(result.kind).not.toBe('unknown');
    if (result.kind !== 'unknown') {
      expect(result.moves).toBeLessThanOrEqual(optimal);
    }
  });

  it('returns unknown for pattern levels (no numeric-goal distance)', () => {
    const state = makeStateWithMoves(3, [7, 6]);

    expect(remainingMoves(state, true)).toEqual({ kind: 'unknown' });
  });

  it('falls back to the Manhattan lower bound on large grids', () => {
    // 6x6 blank starts at index 35; slide the tile above, then the one left of it.
    const state = makeStateWithMoves(6, [29, 28]);

    const result = remainingMoves(state);

    expect(result.kind).toBe('atLeast');
    if (result.kind !== 'unknown') {
      expect(result.moves).toBe(manhattanDistance(state));
      expect(result.moves).toBeGreaterThan(0);
    }
  });
});

describe('tensionLevelFor', () => {
  it.each([
    [21, 0],
    [20, 1],
    [11, 1],
    [10, 2],
    [6, 2],
    [5, 3],
    [1, 3],
    [0, 3],
  ])('maps %i exact remaining moves to level %i', (moves, level) => {
    expect(tensionLevelFor({ kind: 'exact', moves })).toBe(level);
  });

  it('never escalates on a lower-bound estimate, however small', () => {
    expect(tensionLevelFor({ kind: 'atLeast', moves: 1 })).toBe(0);
    expect(tensionLevelFor({ kind: 'atLeast', moves: 20 })).toBe(0);
  });

  it('never escalates when the distance is unknown', () => {
    expect(tensionLevelFor({ kind: 'unknown' })).toBe(0);
  });
});

describe('greedyNextMove', () => {
  it('returns null for solved state', () => {
    expect(greedyNextMove(createSolvedState(3))).toBeNull();
  });

  it('returns a move that improves manhattan distance', () => {
    const state = applyMove(createSolvedState(3), 7);
    const move = greedyNextMove(state);
    expect(move).not.toBeNull();
    const next = applyMove(state, move!.from);
    expect(isSolved(next)).toBe(true);
  });
});

describe('computeHint', () => {
  it('returns unavailable for solved state', () => {
    const result = computeHint(createSolvedState(3), 1);
    expect(result.type).toBe('unavailable');
  });

  it('returns 1 move for 1-step hint', () => {
    const state = applyMove(createSolvedState(3), 7);
    const result = computeHint(state, 1);
    expect(result.type).toBe('moves');
    if (result.type === 'moves') {
      expect(result.moves.length).toBe(1);
    }
  });

  it('returns up to 3 moves for 3-step hint', () => {
    const state = makeStateWithMoves(3, [7, 5, 4]);
    const result = computeHint(state, 3);
    expect(result.type).toBe('moves');
    if (result.type === 'moves') {
      expect(result.moves.length).toBeLessThanOrEqual(3);
    }
  });
});
