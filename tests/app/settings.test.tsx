import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../../src/app/settings/index';
import { useProgressStore } from '../../src/store/progressStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { WORLDS } from '../../src/data/worlds';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
      ios: { buildNumber: '1' },
      android: { versionCode: 1 },
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('Settings screen', () => {
  beforeEach(() => {
    mockBack.mockClear();
    useProgressStore.getState().reset();
  });

  it('shows the app version and build number', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('1.0.0 (1)')).toBeTruthy();
  });

  it('unlocks all worlds on a 5s long press of the version label', () => {
    render(<SettingsScreen />);

    fireEvent(screen.getByLabelText('App-Version'), 'longPress');

    expect(useProgressStore.getState().unlockedWorldIds.sort()).toEqual(
      WORLDS.map((world) => world.id).sort(),
    );
  });

  it('goes back via the close button', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByLabelText('Schließen'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('toggles visual effects on and off', () => {
    render(<SettingsScreen />);

    fireEvent(screen.getByLabelText('Visuelle Effekte'), 'valueChange', false);

    expect(useSettingsStore.getState().visualEffectsEnabled).toBe(false);
  });

  it('toggles sound on and off', () => {
    render(<SettingsScreen />);

    fireEvent(screen.getByLabelText('Sound'), 'valueChange', false);

    expect(useSettingsStore.getState().soundEnabled).toBe(false);
  });

  it('toggles music on and off', () => {
    render(<SettingsScreen />);

    fireEvent(screen.getByLabelText('Musik'), 'valueChange', false);

    expect(useSettingsStore.getState().musicEnabled).toBe(false);
  });
});
