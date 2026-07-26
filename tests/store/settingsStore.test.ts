import { useSettingsStore } from '../../src/store/settingsStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('settingsStore visualEffectsEnabled', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
  });

  it('defaults to enabled', () => {
    expect(useSettingsStore.getState().visualEffectsEnabled).toBe(true);
  });

  it('updates when set to disabled', () => {
    useSettingsStore.getState().setSetting('visualEffectsEnabled', false);

    expect(useSettingsStore.getState().visualEffectsEnabled).toBe(false);
  });
});

describe('settingsStore soundEnabled / musicEnabled', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
  });

  it('default to enabled', () => {
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
    expect(useSettingsStore.getState().musicEnabled).toBe(true);
  });

  it('update independently when set to disabled', () => {
    useSettingsStore.getState().setSetting('soundEnabled', false);

    expect(useSettingsStore.getState().soundEnabled).toBe(false);
    expect(useSettingsStore.getState().musicEnabled).toBe(true);
  });
});
