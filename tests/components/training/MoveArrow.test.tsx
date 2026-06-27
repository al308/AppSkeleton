import { render, screen } from '@testing-library/react-native';
import {
  MoveArrow,
  slideDirection,
  arrowTransform,
} from '../../../src/components/training/MoveArrow';
import { Move } from '../../../src/engine/puzzle';

describe('slideDirection', () => {
  it('reads the slide direction from the move geometry on a 3x3', () => {
    // The tile slides toward the blank (to). Direction = where the blank sits.
    expect(slideDirection({ from: 4, to: 1 } as Move, 3)).toBe('up'); // blank above → tile slides up
    expect(slideDirection({ from: 1, to: 4 } as Move, 3)).toBe('down'); // blank below
    expect(slideDirection({ from: 1, to: 0 } as Move, 3)).toBe('left'); // blank to the left
    expect(slideDirection({ from: 0, to: 1 } as Move, 3)).toBe('right'); // blank to the right
  });
});

describe('arrowTransform', () => {
  // Regression guard: the chevron's rotation must never be dropped from the transform —
  // a base `›` only points the right way once rotated, and an earlier bug let the
  // animated transform clobber it so every arrow pointed right.
  it('rotates the chevron to match each slide direction', () => {
    const rotationOf = (dir: Parameters<typeof arrowTransform>[0]): string | undefined => {
      const part = arrowTransform(dir, 0).find((p) => 'rotate' in p);
      return part && 'rotate' in part ? part.rotate : undefined;
    };

    expect(rotationOf('right')).toBe('0deg');
    expect(rotationOf('down')).toBe('90deg');
    expect(rotationOf('up')).toBe('-90deg');
    expect(rotationOf('left')).toBe('180deg');
  });

  it('always includes both a translate and a rotate, in that order', () => {
    const t = arrowTransform('down', 5);

    expect(t).toHaveLength(2);
    expect(t[0]).toEqual({ translateY: 5 });
    expect(t[1]).toEqual({ rotate: '90deg' });
  });
});

describe('MoveArrow', () => {
  it('renders an arrow for the expected move (reduced motion, no animation timers)', () => {
    render(<MoveArrow move={{ from: 5, to: 4 }} gridSize={3} tileSize={90} gap={2} reduceMotion />);

    // The arrow is intentionally hidden from assistive tech, so opt hidden nodes in.
    expect(screen.getByTestId('move-arrow', { includeHiddenElements: true })).toBeTruthy();
  });

  it('positions the arrow over the moving tile', () => {
    render(<MoveArrow move={{ from: 4, to: 3 }} gridSize={3} tileSize={90} gap={2} reduceMotion />);

    const arrow = screen.getByTestId('move-arrow', { includeHiddenElements: true });
    // position index 4 on a 3x3 is row 1, col 1 → left/top = 1 * (90 + 2) = 92
    expect(arrow.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ left: 92, top: 92 })]),
    );
  });
});
