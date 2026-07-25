import React from 'react';
import { render } from '@testing-library/react-native';
import { BlankGlow } from '../../../src/components/puzzle/BlankGlow';

describe('BlankGlow', () => {
  it('renders nothing when disabled', () => {
    const { toJSON } = render(
      <BlankGlow positionIndex={4} gridSize={3} tileSize={90} enabled={false} />,
    );

    expect(toJSON()).toBeNull();
  });

  it('renders a glow view when enabled', () => {
    const { toJSON } = render(<BlankGlow positionIndex={4} gridSize={3} tileSize={90} enabled />);

    expect(toJSON()).not.toBeNull();
  });
});
