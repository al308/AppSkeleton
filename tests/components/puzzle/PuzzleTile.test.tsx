import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useSharedValue } from 'react-native-reanimated';
import { PuzzleTile } from '../../../src/components/puzzle/PuzzleTile';
import { GlyphMotif } from '../../../src/engine/patterns';

type HarnessProps = {
  glyph?: GlyphMotif;
  forceNumber?: boolean;
  showNumber?: boolean;
};

function Harness({ glyph, forceNumber, showNumber = false }: HarnessProps): React.ReactElement {
  const animX = useSharedValue(0);
  const animY = useSharedValue(0);
  return (
    <PuzzleTile
      tileId={5}
      positionIndex={0}
      gridSize={3}
      tileSize={90}
      patternColor="#112233"
      glyph={glyph}
      forceNumber={forceNumber}
      showNumber={showNumber}
      isHinted={false}
      animX={animX}
      animY={animY}
      textColor="#ffffff"
      accentColor="#a78bfa"
    />
  );
}

describe('PuzzleTile patterns', () => {
  it('renders a line glyph when a glyph motif is set', () => {
    render(<Harness glyph="lines_d" />);

    expect(screen.getByTestId('tile-glyph', { includeHiddenElements: true })).toBeTruthy();
  });

  it('renders no glyph when motif is none', () => {
    render(<Harness glyph="none" />);

    expect(screen.queryByTestId('tile-glyph', { includeHiddenElements: true })).toBeNull();
  });

  it('shows the tile number for number style even when showNumber is false', () => {
    render(<Harness forceNumber showNumber={false} />);

    expect(screen.getByText('5', { includeHiddenElements: true })).toBeTruthy();
  });
});
