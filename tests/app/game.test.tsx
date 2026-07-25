import { render, screen } from '@testing-library/react-native';
import GameScreen from '../../src/app/game/[id]';
import { useGameStore } from '../../src/store/gameStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useProgressStore } from '../../src/store/progressStore';
import { createSolvedState, applyMove } from '../../src/engine/puzzle';
import { shuffleFromSeed } from '../../src/engine/shuffle';

const mockState = { id: 'natur_01' };

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockState.id }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('GameScreen tension chrome', () => {
  beforeEach(() => {
    mockState.id = 'natur_01';
    useGameStore.getState().clearGame();
    useProgressStore.getState().reset();
    useSettingsStore.getState().reset();
  });

  it('shows no tension chrome on a grid larger than 3x3 (lower-bound estimate only)', () => {
    // 4x4+ grids never get an exact remaining-move count (see LIVE_OPTIMAL_MAX_SIZE
    // in engine/solver.ts) — tensionLevelFor must stay 0 regardless of how close
    // the Manhattan lower bound suggests the player might be.
    mockState.id = 'natur_04';
    const shuffled = shuffleFromSeed(4, 'relaxed', 1);
    useGameStore.getState().startGame({
      levelId: 'natur_04',
      initialState: shuffled,
      hintsAllowed: 4,
    });

    render(<GameScreen />);

    expect(screen.queryByTestId('board-glow')).toBeNull();
  });

  it('escalates tension chrome when exactly a few moves remain', () => {
    // 3x3 grids report an exact remaining-move count. One move away from
    // solved is well inside the level-3 threshold (<= 5).
    const oneMoveAway = applyMove(createSolvedState(3), 7);
    useGameStore.getState().startGame({
      levelId: 'natur_01',
      initialState: oneMoveAway,
      hintsAllowed: 5,
    });

    render(<GameScreen />);

    expect(screen.getByTestId('board-glow')).toBeTruthy();
  });

  it('shows no tension chrome when visual effects are disabled', () => {
    const oneMoveAway = applyMove(createSolvedState(3), 7);
    useGameStore.getState().startGame({
      levelId: 'natur_01',
      initialState: oneMoveAway,
      hintsAllowed: 5,
    });
    useSettingsStore.getState().setSetting('visualEffectsEnabled', false);

    render(<GameScreen />);

    expect(screen.queryByTestId('board-glow')).toBeNull();
  });
});
