# Sound effects + music support

## Outcome

Shiffle currently has zero audio layer — only `expo-haptics` (tile move,
invalid move, win). This feature adds a real SFX + ambient-music system:
generated audio assets wired into every existing haptic touchpoint, plus a
per-world looping ambient bed, all controllable from Settings with
independent Sound and Music toggles (mirroring the existing
`hapticsEnabled` pattern).

Asset sourcing is a separate, already-in-progress track
(`assetgen/sounds.yaml`, 14 SFX + 9 per-world ambience beds via Stable
Audio Open 1.0 — see `assetgen/docs/AUDIO.md`). This spec covers the
**app-side engine and wiring**, decoupled from whether final files exist
yet: the engine must work against a placeholder/missing-asset set without
crashing, so integration can land before generation finishes.

## Scope

- New dependency: `expo-audio` (SDK 54's current audio API; `expo-av`'s
  audio APIs are deprecated). Installed via `npx expo install expo-audio`.
- New settings: `soundEnabled: boolean` (SFX) and `musicEnabled: boolean`
  (ambient beds), both defaulting to `true`, added to
  `src/store/settingsStore.ts` alongside `hapticsEnabled`. Two independent
  toggles, not one combined "audio" switch — a player may want tile-click
  SFX without a continuous music bed, or vice versa.
- New module `src/audio/` (side-effect isolation, per `.claude/rules/10-typescript-style.md`):
  - `soundEffects.ts` — a thin wrapper around `expo-audio`'s
    `useAudioPlayer`/`createAudioPlayer` for one-shot SFX playback: preload
    all SFX players once, expose `playSound(name: SoundEffectName): void`.
    No-ops (logs once, doesn't throw) if an asset is missing, so the app
    keeps working before/without generated files.
  - `musicPlayer.ts` — a singleton looping player for the active world's
    ambience bed: `playWorldMusic(worldId: string): void`,
    `stopMusic(): void`, cross-fades on world change (simple linear volume
    ramp, ~600ms, via `expo-audio`'s `setVolumeAsync` on a timer — no new
    animation dependency).
  - `assetMap.ts` — `Record<SoundEffectName, number | undefined>` /
    `Record<WorldId, number | undefined>` static `require()` maps (RN
    requires static require paths). Entries stay `undefined` until a real
    file lands in `assets/audio/`; consumers treat `undefined` as "asset
    not shipped yet" and no-op rather than crash.
  - `errors.ts` — none needed beyond existing `console.warn` no-op path;
    audio playback failure is not a domain error worth a custom class,
    it's an expected degraded-mode (missing/corrupt asset, OS denies
    audio focus) that should never interrupt gameplay.
- Real asset landing zone: `assets/audio/sfx/*.mp3`,
  `assets/audio/music/*.mp3` (binary assets — per
  `.claude/rules/30-dont-touch.md` these are design-owned; this feature
  only creates the _directories and loader plumbing_, not the files
  themselves — those come from the assetgen batch once generation is
  unblocked, then a human copies winners in and updates `assetMap.ts`,
  same review step as image assets already follow).
- Wiring into existing touchpoints (all become `playSound(...)` calls
  alongside the existing `Haptics.*` calls, never replacing them):
  - `src/components/puzzle/PuzzleBoard.tsx` `triggerHaptic` →
    `tile-slide` (valid) / `tile-invalid` (invalid).
  - `src/components/celebration/CompletionModal.tsx` win effect →
    `level-complete-fanfare`, plus `new-best-record` when `isNewBest`.
  - `src/components/celebration/ConfettiEmitter` (or its trigger site in
    `src/app/game/[id].tsx`) → `confetti-burst`.
  - Star reveal in `CompletionModal`'s `StarRating` mount → `star-earned`
    (one shot, not per-star-repeated, to avoid overlapping triggers).
  - `src/app/game/[id].tsx` `handleHint` → `hint-reveal`.
  - `src/app/worlds.tsx` / `src/app/world/[id].tsx` unlock transitions →
    `world-unlock` / `level-unlock`.
  - Generic `GameButton` (`src/components/ui/GameButton.tsx`) press →
    `button-tap`, so every screen gets it for free without per-screen
    wiring; back-navigation `Pressable`s across `worlds.tsx`,
    `world/[id].tsx`, `settings/index.tsx`, `game/[id].tsx` → `nav-back`.
  - Pause modal open/close (`src/app/game/[id].tsx` `showPause`) →
    `modal-open` / `modal-close`.
  - `src/app/training/[lesson].tsx` step-complete transition →
    `training-step-complete`.
  - World music: start on `src/app/world/[id].tsx` mount (`playWorldMusic(worldId)`)
    and `src/app/game/[id].tsx` mount (same world's bed continues), stop
    on unmount back to `worlds.tsx`/menu root (`src/app/index.tsx`).
- Settings screen (`src/app/settings/index.tsx`): new `SwitchRow`s for
  "Sound" and "Musik" in the existing "Steuerung" section, next to
  "Haptisches Feedback", following the identical `setSetting` pattern.

## Non-Goals

- No custom audio-mixing UI (volume sliders) — on/off toggles only, same
  granularity as `hapticsEnabled`. A volume slider is a possible future
  iteration, not in this pass.
- No dynamic/adaptive music (tempo shifts under time pressure, layered
  stems) — one static loopable bed per world, cross-faded on world change.
- Does not include running the actual `assetgen` generation batch or
  choosing winning candidates — that's tracked separately
  (`assetgen/sounds.yaml` already written; blocked on the HuggingFace
  account accepting the `stabilityai/stable-audio-open-1.0` gated-repo
  license before any file can download).
- No `.env`/RunPod/pipeline changes — this spec is app-code only.
- Not touching `expo-haptics` calls — sound is additive, haptics stay as
  they are.

## Implementation note (added post-implementation)

`world-unlock` and `level-unlock` sounds are registered in
`assetMap.ts`/`sounds.yaml` but **not wired** to a trigger. Both
`worlds.tsx` and `world/[id].tsx` derive unlock status by re-reading
`records`/`unlockedWorldIds` on every render — there is no explicit
"this just transitioned from locked to unlocked" event to hook a one-shot
sound to without adding new transition-tracking state, which is out of
this pass's scope. Revisit if/when an explicit unlock-celebration moment
(e.g. a modal or animation) is added to those screens — that would be the
natural place to fire these two sounds.

## Constraints

- `expo-audio` installed via `npx expo install expo-audio` (SDK-managed
  version resolution), never plain `npm install` — per
  `CLAUDE.md`'s dependency notes.
- All new code: TypeScript strict, no `any`, explicit return types on
  exports, function components only, `StyleSheet.create` for any new
  visual bits (none expected — this is a logic-only module plus two
  Settings rows).
- No bare `catch {}` — asset-load/playback failures must be caught,
  logged via `console.warn`, and degrade silently (game must never crash
  or block on missing/broken audio).
- Real `.mp3` binaries under `assets/` are design-owned
  (`.claude/rules/30-dont-touch.md`) — this feature must function
  correctly with **zero** real files present (`assetMap.ts` entries all
  `undefined`), and upgrade automatically once files + map entries are
  added, no code changes required at that point.
- Respect existing settings persistence shape
  (`zustand/middleware persist` + AsyncStorage,
  `src/store/settingsStore.ts`) — new keys, no migration needed since
  `persist` merges partial state against `DEFAULTS`.

## Task Breakdown

1. `npx expo install expo-audio`; verify it lands a SDK54-compatible
   version in `package.json`/`package-lock.json`.
2. `src/store/settingsStore.ts`: add `soundEnabled`, `musicEnabled` to
   `Settings` + `DEFAULTS` (both `true`).
3. `src/audio/assetMap.ts`: define `SoundEffectName` union (14 names from
   `assetgen/sounds.yaml`'s SFX entries) and `WorldId`-keyed music map,
   both initialized to all-`undefined` (no real files yet).
4. `src/audio/soundEffects.ts`: preload/create players from `assetMap`,
   `playSound(name)` that no-ops + warns-once on `undefined` entry or
   thrown playback error, respects `soundEnabled` from the settings store.
5. `src/audio/musicPlayer.ts`: `playWorldMusic(worldId)` /
   `stopMusic()` singleton with cross-fade, respects `musicEnabled`,
   no-ops on `undefined` map entry.
6. Wire `playSound(...)` into each touchpoint listed in Scope.
7. Wire `playWorldMusic`/`stopMusic` into world/game screen
   mount/unmount.
8. `src/app/settings/index.tsx`: add "Sound" and "Musik" `SwitchRow`s.
9. Directories: `assets/audio/sfx/.gitkeep`, `assets/audio/music/.gitkeep`
   (empty landing zone, real files added later by a human per the
   assetgen review step).
10. Tests (`tests/audio/soundEffects.test.ts`,
    `tests/audio/musicPlayer.test.ts`,
    `tests/store/settingsStore.test.ts` extension,
    `tests/app/settings.test.tsx` extension): fake/mock `expo-audio` at
    the boundary (no real audio playback in Jest, per
    `.claude/rules/20-testing.md`'s "mock at the boundary" rule) —
    assert `playSound`/`playWorldMusic` no-op cleanly when disabled or
    when the asset map entry is `undefined`, and call the underlying
    player API when enabled + present.

## Verification

- `npm test -- tests/audio tests/store/settingsStore.test.ts tests/app/settings.test.tsx`
- `just check` (lint + typecheck + full suite) before commit.
- Manual: with `soundEnabled`/`musicEnabled` both on but zero real audio
  files present, play through a full level (move tiles, trigger an
  invalid move, request a hint, win) — app must not crash or log
  unhandled errors, only the expected one-time "asset missing" warnings.
- Once real files are added (separate step, outside this spec): repeat
  the manual pass and confirm each touchpoint actually plays its sound,
  and world ambience cross-fades cleanly between world screen and game
  screen without restarting the loop.
