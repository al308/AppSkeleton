import {
  createSolvedState,
  getAdjacentIndices,
  isValidMove,
  applyMove,
  isSolved,
  manhattanDistance,
} from '../../src/engine/puzzle';

describe('createSolvedState', () => {
  it('creates a 3x3 solved state', () => {
    const state = createSolvedState(3);
    expect(state.tiles).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    expect(state.blankIndex).toBe(8);
    expect(state.size).toBe(3);
  });

  it('creates a 4x4 solved state with blank at index 15', () => {
    const state = createSolvedState(4);
    expect(state.tiles[15]).toBe(0);
    expect(state.blankIndex).toBe(15);
  });
});

describe('getAdjacentIndices', () => {
  it('returns 2 neighbors for corner blank (3x3)', () => {
    const adj = getAdjacentIndices(0, 3);
    expect(adj.sort()).toEqual([1, 3]);
  });

  it('returns 4 neighbors for center blank (3x3)', () => {
    const adj = getAdjacentIndices(4, 3);
    expect(adj.sort()).toEqual([1, 3, 5, 7]);
  });

  it('returns 3 neighbors for edge blank (3x3)', () => {
    const adj = getAdjacentIndices(1, 3);
    expect(adj.sort()).toEqual([0, 2, 4]);
  });
});

describe('isValidMove', () => {
  it('valid move: tile adjacent to blank', () => {
    const state = createSolvedState(3); // blank at 8
    expect(isValidMove(state, 7)).toBe(true); // left of blank
    expect(isValidMove(state, 5)).toBe(true); // above blank
  });

  it('invalid move: non-adjacent tile', () => {
    const state = createSolvedState(3);
    expect(isValidMove(state, 0)).toBe(false);
    expect(isValidMove(state, 4)).toBe(false);
  });
});

describe('applyMove', () => {
  it('swaps tile with blank', () => {
    const state = createSolvedState(3); // blank at 8, tile 8 at index 7
    const next = applyMove(state, 7);
    expect(next.tiles[8]).toBe(8);
    expect(next.tiles[7]).toBe(0);
    expect(next.blankIndex).toBe(7);
  });
});

describe('isSolved', () => {
  it('solved state returns true', () => {
    const state = createSolvedState(3);
    expect(isSolved(state)).toBe(true);
  });

  it('state with one move is not solved', () => {
    const state = createSolvedState(3);
    const moved = applyMove(state, 7);
    expect(isSolved(moved)).toBe(false);
  });
});

describe('manhattanDistance', () => {
  it('solved state has distance 0', () => {
    expect(manhattanDistance(createSolvedState(3))).toBe(0);
  });

  it('one move from solved has distance 1', () => {
    const state = applyMove(createSolvedState(3), 7);
    expect(manhattanDistance(state)).toBe(1);
  });
});
