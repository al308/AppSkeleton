import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { GameBackground } from '../../../src/components/ui/GameBackground';

describe('GameBackground', () => {
  it('renders its children on the neutral backdrop', () => {
    render(
      <GameBackground>
        <Text>hallo</Text>
      </GameBackground>,
    );

    expect(screen.getByText('hallo')).toBeTruthy();
  });

  it('renders its children when given a world', () => {
    render(
      <GameBackground worldId="natur">
        <Text>welt</Text>
      </GameBackground>,
    );

    expect(screen.getByText('welt')).toBeTruthy();
  });
});
