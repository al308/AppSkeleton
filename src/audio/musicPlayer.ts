import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useSettingsStore } from '../store/settingsStore';
import { WORLD_MUSIC_ASSETS } from './assetMap';

const FADE_DURATION_MS = 600;
const FADE_STEPS = 12;
const FADE_STEP_MS = FADE_DURATION_MS / FADE_STEPS;

let activePlayer: AudioPlayer | undefined;
let activeWorldId: string | undefined;
let fadeTimer: ReturnType<typeof setInterval> | undefined;
const warnedMissing = new Set<string>();

function clearFade(): void {
  if (fadeTimer !== undefined) {
    clearInterval(fadeTimer);
    fadeTimer = undefined;
  }
}

function fadeOutAndStop(player: AudioPlayer): void {
  let step = 0;
  const startVolume = player.volume;
  const timer = setInterval(() => {
    step += 1;
    const nextVolume = Math.max(0, startVolume * (1 - step / FADE_STEPS));
    try {
      player.volume = nextVolume;
    } catch {
      clearInterval(timer);
      return;
    }
    if (step >= FADE_STEPS) {
      clearInterval(timer);
      try {
        player.pause();
        player.remove();
      } catch (error) {
        console.warn('[audio] failed to release music player', error);
      }
    }
  }, FADE_STEP_MS);
}

function fadeIn(player: AudioPlayer): void {
  let step = 0;
  player.volume = 0;
  fadeTimer = setInterval(() => {
    step += 1;
    try {
      player.volume = Math.min(1, step / FADE_STEPS);
    } catch {
      clearFade();
      return;
    }
    if (step >= FADE_STEPS) clearFade();
  }, FADE_STEP_MS);
}

export function playWorldMusic(worldId: string): void {
  if (worldId === activeWorldId) return;

  const previousPlayer = activePlayer;
  activePlayer = undefined;
  activeWorldId = worldId;
  clearFade();
  if (previousPlayer) fadeOutAndStop(previousPlayer);

  if (!useSettingsStore.getState().musicEnabled) return;

  const source = WORLD_MUSIC_ASSETS[worldId];
  if (source === undefined) {
    if (!warnedMissing.has(worldId)) {
      warnedMissing.add(worldId);
      console.warn(`[audio] no music asset registered for world "${worldId}", skipping playback`);
    }
    return;
  }

  const player = createAudioPlayer(source);
  player.loop = true;
  activePlayer = player;
  fadeIn(player);
  player.play();
}

export function stopMusic(): void {
  const previousPlayer = activePlayer;
  activePlayer = undefined;
  activeWorldId = undefined;
  clearFade();
  if (previousPlayer) fadeOutAndStop(previousPlayer);
}

// Reacts to the settings toggle so muting mid-playback stops the current
// bed immediately, and re-enabling resumes the active world's music instead
// of waiting for the next screen mount.
useSettingsStore.subscribe((state, prevState) => {
  if (state.musicEnabled === prevState.musicEnabled) return;

  if (!state.musicEnabled) {
    const previousPlayer = activePlayer;
    const worldId = activeWorldId;
    activePlayer = undefined;
    clearFade();
    if (previousPlayer) fadeOutAndStop(previousPlayer);
    activeWorldId = worldId;
    return;
  }

  if (state.musicEnabled && activeWorldId && !activePlayer) {
    const worldId = activeWorldId;
    activeWorldId = undefined;
    playWorldMusic(worldId);
  }
});
