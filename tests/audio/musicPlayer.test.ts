import { useSettingsStore } from '../../src/store/settingsStore';

const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockRemove = jest.fn();
const mockCreateAudioPlayer = jest.fn((_source: unknown) => ({
  play: mockPlay,
  pause: mockPause,
  remove: mockRemove,
  seekTo: jest.fn().mockResolvedValue(undefined),
  volume: 1,
  loop: false,
}));

jest.mock('expo-audio', () => ({
  createAudioPlayer: (source: unknown) => mockCreateAudioPlayer(source),
}));

jest.mock('../../src/audio/assetMap', () => ({
  WORLD_MUSIC_ASSETS: {
    natur: 7,
    tiere: undefined,
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { playWorldMusic, stopMusic } = require('../../src/audio/musicPlayer');

describe('playWorldMusic', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
    stopMusic();
    mockPlay.mockClear();
    mockPause.mockClear();
    mockRemove.mockClear();
    mockCreateAudioPlayer.mockClear();
  });

  it('creates a looping player for a registered world', () => {
    playWorldMusic('natur');

    expect(mockCreateAudioPlayer).toHaveBeenCalledWith(7);
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('does not create a player when music is disabled in settings', () => {
    useSettingsStore.getState().setSetting('musicEnabled', false);

    playWorldMusic('natur');

    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
  });

  it('no-ops when the world has no registered music asset', () => {
    playWorldMusic('tiere');

    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
  });

  it('does not recreate a player when the same world is requested again', () => {
    playWorldMusic('natur');
    mockCreateAudioPlayer.mockClear();

    playWorldMusic('natur');

    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
  });
});
