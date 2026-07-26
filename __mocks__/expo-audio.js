// expo-audio's native module isn't available under jest-expo (unlike
// expo-haptics, it has no built-in test mock as of SDK 54). Component tests
// that render anything using src/audio/* (GameButton, PuzzleBoard, screens)
// need this so `import ... from 'expo-audio'` doesn't crash on the missing
// native binding. Tests asserting actual playback behavior mock
// src/audio/soundEffects.ts / musicPlayer.ts directly instead of this file,
// so this stub doesn't need jest.fn() spies of its own.
function noop() {}

function createAudioPlayer() {
  return {
    play: noop,
    pause: noop,
    remove: noop,
    replace: noop,
    seekTo: () => Promise.resolve(undefined),
    volume: 1,
    loop: false,
  };
}

module.exports = {
  createAudioPlayer,
  useAudioPlayer: createAudioPlayer,
  useAudioPlayerStatus: noop,
  setIsAudioActiveAsync: () => Promise.resolve(undefined),
  setAudioModeAsync: () => Promise.resolve(undefined),
};
