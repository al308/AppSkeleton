import { useSettingsStore } from '../../src/store/settingsStore';

const mockPlay = jest.fn();
const mockSeekTo = jest.fn().mockResolvedValue(undefined);
const mockCreateAudioPlayer = jest.fn((_source: unknown) => ({
  play: mockPlay,
  seekTo: mockSeekTo,
  pause: jest.fn(),
  remove: jest.fn(),
  volume: 1,
  loop: false,
}));

jest.mock('expo-audio', () => ({
  createAudioPlayer: (source: unknown) => mockCreateAudioPlayer(source),
}));

jest.mock('../../src/audio/assetMap', () => ({
  SOUND_EFFECT_ASSETS: {
    'tile-slide': 42,
    'tile-invalid': undefined,
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { playSound } = require('../../src/audio/soundEffects');

describe('playSound', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
    mockPlay.mockClear();
    mockSeekTo.mockClear();
    mockCreateAudioPlayer.mockClear();
  });

  it('plays the registered asset for the sound', async () => {
    playSound('tile-slide');
    await Promise.resolve();
    await Promise.resolve();

    expect(mockCreateAudioPlayer).toHaveBeenCalledWith(42);
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('does not create a player when sound is disabled in settings', () => {
    useSettingsStore.getState().setSetting('soundEnabled', false);

    playSound('tile-slide');

    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
  });

  it('no-ops when the asset map entry is undefined', () => {
    playSound('tile-invalid');

    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
  });
});
