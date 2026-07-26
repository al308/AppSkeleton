import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useSettingsStore } from '../store/settingsStore';
import { SoundEffectName, SOUND_EFFECT_ASSETS } from './assetMap';

const players = new Map<SoundEffectName, AudioPlayer>();
const warnedMissing = new Set<SoundEffectName>();

function getPlayer(name: SoundEffectName): AudioPlayer | undefined {
  const existing = players.get(name);
  if (existing) return existing;

  const source = SOUND_EFFECT_ASSETS[name];
  if (source === undefined) {
    if (!warnedMissing.has(name)) {
      warnedMissing.add(name);
      console.warn(`[audio] no sound asset registered for "${name}", skipping playback`);
    }
    return undefined;
  }

  const player = createAudioPlayer(source);
  players.set(name, player);
  return player;
}

export function playSound(name: SoundEffectName): void {
  if (!useSettingsStore.getState().soundEnabled) return;

  const player = getPlayer(name);
  if (!player) return;

  player
    .seekTo(0)
    .then(() => player.play())
    .catch((error: unknown) => {
      console.warn(`[audio] failed to play sound "${name}"`, error);
    });
}
