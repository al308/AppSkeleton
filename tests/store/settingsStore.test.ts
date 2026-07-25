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
