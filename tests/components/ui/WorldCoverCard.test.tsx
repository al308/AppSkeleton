import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { WorldCoverCard } from '../../../src/components/ui/WorldCoverCard';
import type { World } from '../../../src/data/worlds';
import type { WorldProgress } from '../../../src/store/selectors';

const world: World = {
  id: 'muster',
  title: 'Muster',
  description: 'Geometrische Muster und Farbverläufe',
  unlockStarThreshold: 5,
};

const progress: WorldProgress = {
  solvedCount: 4,
  totalLevels: 9,
  earnedStars: 9,
  maxStars: 27,
};

describe('WorldCoverCard', () => {
  it('shows title and category progress for an unlocked world', () => {
    render(<WorldCoverCard world={world} progress={progress} isUnlocked onPress={() => {}} />);

    expect(screen.getByText('Muster')).toBeTruthy();
    expect(screen.getByText('4/9 gelöst')).toBeTruthy();
    expect(screen.getByText(/9\/27/)).toBeTruthy();
  });

  it('navigates on press when unlocked', () => {
    const onPress = jest.fn();
    render(<WorldCoverCard world={world} progress={progress} isUnlocked onPress={onPress} />);

    fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a locked state with the unlock threshold and is disabled', () => {
    const onPress = jest.fn();
    render(
      <WorldCoverCard world={world} progress={progress} isUnlocked={false} onPress={onPress} />,
    );

    const button = screen.getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('★ 5 zum Freischalten')).toBeTruthy();

    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
