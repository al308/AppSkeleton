import { render, screen } from '@testing-library/react-native';
import { GhostTarget } from '../../../src/components/training/GhostTarget';
import { PuzzleState } from '../../../src/engine/puzzle';

function stateOf(tiles: number[], size: number): PuzzleState {
  return { tiles, size, blankIndex: tiles.indexOf(0) };
}

describe('GhostTarget', () => {
  it('renders a dashed target at the moving tile home square', () => {
    // tile value 5 sits at position 0; its home is position 4 (row 1, col 1).
    const state = stateOf([5, 1, 3, 4, 2, 6, 7, 8, 0], 3);

    render(
      <GhostTarget puzzleState={state} movingFrom={0} tileSize={90} gap={2} showNumber={false} />,
    );

    const ghost = screen.getByTestId('ghost-target', { includeHiddenElements: true });
    expect(ghost.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ left: 92, top: 92 })]),
    );
  });

  it('shows the tile number when requested', () => {
    const state = stateOf([5, 1, 3, 4, 2, 6, 7, 8, 0], 3);

    render(<GhostTarget puzzleState={state} movingFrom={0} tileSize={90} gap={2} showNumber />);

    expect(screen.getByText('5', { includeHiddenElements: true })).toBeTruthy();
  });

  it('renders nothing when the moving tile is already home', () => {
    // tile 1 already sits at its home position 0.
    const state = stateOf([1, 5, 3, 4, 2, 6, 7, 8, 0], 3);

    render(
      <GhostTarget puzzleState={state} movingFrom={0} tileSize={90} gap={2} showNumber={false} />,
    );

    expect(screen.queryByTestId('ghost-target')).toBeNull();
  });
});
