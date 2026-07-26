// Static require() maps for every audio touchpoint the app knows about.
// Entries stay `undefined` until a reviewed .mp3 lands in assets/audio/ and
// is registered here — soundEffects.ts / musicPlayer.ts treat `undefined` as
// "not shipped yet" and no-op instead of crashing. Names mirror
// assetgen/sounds.yaml's asset `name:` fields 1:1.
//
// Current files are candidate-1 from the assetgen batch, wired in as a
// placeholder default — not yet the reviewed/chosen winner. Swap the
// require() target once a candidate is picked from
// assetgen/.assetgen-staging/audio/<name>/.

export type SoundEffectName =
  | 'tile-slide'
  | 'tile-invalid'
  | 'hint-reveal'
  | 'level-complete-fanfare'
  | 'new-best-record'
  | 'star-earned'
  | 'confetti-burst'
  | 'world-unlock'
  | 'level-unlock'
  | 'button-tap'
  | 'nav-back'
  | 'modal-open'
  | 'modal-close'
  | 'training-step-complete';

// RN's packager requires static require() paths, so this is a literal map
// rather than a dynamic `require(\`./sfx/${name}.mp3\`)`.
export const SOUND_EFFECT_ASSETS: Record<SoundEffectName, number | undefined> = {
  'tile-slide': require('../../assets/audio/sfx/tile-slide.mp3'),
  'tile-invalid': require('../../assets/audio/sfx/tile-invalid.mp3'),
  'hint-reveal': require('../../assets/audio/sfx/hint-reveal.mp3'),
  'level-complete-fanfare': require('../../assets/audio/sfx/level-complete-fanfare.mp3'),
  'new-best-record': require('../../assets/audio/sfx/new-best-record.mp3'),
  'star-earned': require('../../assets/audio/sfx/star-earned.mp3'),
  'confetti-burst': require('../../assets/audio/sfx/confetti-burst.mp3'),
  'world-unlock': require('../../assets/audio/sfx/world-unlock.mp3'),
  'level-unlock': require('../../assets/audio/sfx/level-unlock.mp3'),
  'button-tap': require('../../assets/audio/sfx/button-tap.mp3'),
  'nav-back': require('../../assets/audio/sfx/nav-back.mp3'),
  'modal-open': require('../../assets/audio/sfx/modal-open.mp3'),
  'modal-close': require('../../assets/audio/sfx/modal-close.mp3'),
  'training-step-complete': require('../../assets/audio/sfx/training-step-complete.mp3'),
};

// Keyed by World.id (src/data/worlds.ts) — plain string there, so no literal
// union here either.
export const WORLD_MUSIC_ASSETS: Record<string, number | undefined> = {
  natur: require('../../assets/audio/music/natur.mp3'),
  tiere: require('../../assets/audio/music/tiere.mp3'),
  planeten: require('../../assets/audio/music/planeten.mp3'),
  fahrzeuge: require('../../assets/audio/music/fahrzeuge.mp3'),
  glyphen: require('../../assets/audio/music/glyphen.mp3'),
  sport: require('../../assets/audio/music/sport.mp3'),
  kosmos: require('../../assets/audio/music/kosmos.mp3'),
  muster: require('../../assets/audio/music/muster.mp3'),
  urban: require('../../assets/audio/music/urban.mp3'),
};
