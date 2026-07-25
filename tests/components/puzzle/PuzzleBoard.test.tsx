import { render, screen } from '@testing-library/react-native';
import { Gesture } from 'react-native-gesture-handler';
import { PuzzleBoard, selectGesture } from '../../../src/components/puzzle/PuzzleBoard';
import { createSolvedState, applyMove, PuzzleState } from '../../../src/engine/puzzle';
import { Level } from '../../../src/data/levels';

describe('selectGesture — control mode', () => {
  it('enables only the tap gesture in tap mode', () => {
    const tap = Gesture.Tap();
    const pan = Gesture.Pan();

    expect(selectGesture('tap', tap, pan)).toBe(tap);
  });

  it('enables only the pan gesture in swipe mode', () => {
    const tap = Gesture.Tap();
    const pan = Gesture.Pan();

    expect(selectGesture('swipe', tap, pan)).toBe(pan);
  });

  it('races both gestures in both mode', () => {
    const tap = Gesture.Tap();
    const pan = Gesture.Pan();

    const composed = selectGesture('both', tap, pan);

    expect(composed).not.toBe(tap);
    expect(composed).not.toBe(pan);
    expect(composed.constructor.name).toBe('ComposedGesture');
  });
});

const level: Level = {
  id: 'test-slide',
  world: 'test',
  title: 'Slide',
  gridSize: 3,
  source: { kind: 'pattern', pattern: { shape: 'stripes_h', colorCount: 2, palette: 'warm' } },
  shuffleDepth: 'relaxed',
  shuffleSeed: 1,
  optimalMoves: 20,
  optimalMovesPattern: 12,
  hintsAllowed: 3,
};

function renderBoard(
  puzzleState: PuzzleState,
  animationsEnabled?: boolean,
  tensionLevel?: 0 | 1 | 2 | 3,
): ReturnType<typeof render> {
  return render(
    <PuzzleBoard
      level={level}
      puzzleState={puzzleState}
      boardSize={270}
      tileSize={90}
      onMove={() => true}
      hintedTileIndex={null}
      hintStep={0}
      showNumbers={false}
      hapticsEnabled={false}
      controlMode="both"
      accentColor="#a78bfa"
      backgroundColor="#ffffff"
      textColor="#000000"
      animationsEnabled={animationsEnabled}
      tensionLevel={tensionLevel}
    />,
  );
}

describe('PuzzleBoard tile animation', () => {
  it('renders every non-blank tile with animations enabled (default)', () => {
    renderBoard(createSolvedState(3));

    expect(screen.getByLabelText('Puzzle 3×3')).toBeTruthy();
    expect(screen.getByLabelText('Kachel 1')).toBeTruthy();
  });

  it('still renders tiles at their new position after a move with animations disabled', () => {
    const solved = createSolvedState(3);
    const moved = applyMove(solved, 7);

    renderBoard(moved, false);

    expect(screen.getByLabelText('Kachel 8')).toBeTruthy();
  });

  it('still renders tiles at their new position after a move with animations enabled', () => {
    const solved = createSolvedState(3);
    const moved = applyMove(solved, 7);

    renderBoard(moved, true);

    expect(screen.getByLabelText('Kachel 8')).toBeTruthy();
  });
});

describe('PuzzleBoard blank glow', () => {
  it('shows a pulsing glow at the blank cell when animations are enabled', () => {
    const { getByTestId } = renderBoard(createSolvedState(3), true);

    expect(getByTestId('blank-glow')).toBeTruthy();
  });

  it('shows nothing at the blank cell when animations are disabled', () => {
    const { queryByTestId } = renderBoard(createSolvedState(3), false);

    expect(queryByTestId('blank-glow')).toBeNull();
  });
});

describe('PuzzleBoard tension glow', () => {
  it('shows no glow ring at tension level 0 (default)', () => {
    const { queryByTestId } = renderBoard(createSolvedState(3));

    expect(queryByTestId('board-glow')).toBeNull();
  });

  it.each([1, 2, 3] as const)('shows a pulsing glow ring at tension level %i', (level) => {
    const { getByTestId } = renderBoard(createSolvedState(3), true, level);

    expect(getByTestId('board-glow')).toBeTruthy();
  });
});
