# Lessons Learned — shipping Expo apps with Claude Code

> Hard-won, cross-app knowledge that isn't obvious from the code or the Expo docs.
> Sources: **Lesen & Schreiben** (live in stores) and **Stellarblox** (Block-Blast
> game, submit-ready). Add to this as each new app teaches you something — it's the
> compounding asset that makes app N+1 faster than app N.
>
> Operational store steps live in [RELEASE.md](./RELEASE.md); this doc is the *why*.

---

## EAS & credentials

- **Don't hardcode Apple credentials in `eas.json`.** Signing certs, provisioning
  profiles and the Android keystore are generated and stored **by EAS under your
  account** (`owner` in `app.json`). Keep `submit.production` as `{}` and let EAS
  resolve the real `appleId` / `ascAppId` / `appleTeamId` interactively at submit
  time. Stellarblox shipped with `YOUR_APPLE_ID@example.com` placeholders for weeks
  — a non-blocker that *looked* like a blocker. The live app (Lesen & Schreiben)
  has an empty `submit.production` and works fine.
- **`appVersionSource: "remote"` + `autoIncrement: true`** on the production
  profile means EAS owns the build number. You never bump `buildNumber` /
  `versionCode` by hand — only the user-facing `version`.
- One EAS account ships many apps; the `projectId` (`eas init`) is per-app, the
  credentials store is per-account.

## Store & metadata

- **Validate store copy against the actual mechanics.** Stellarblox's first store
  text described "falling blocks", "rotate", "stack reaches the top" — it's a
  *Block-Blast* game (drag-and-drop, no gravity, no rotation). Copy drifts from
  templates and earlier ideas; re-read it against what the app actually does.
- **Feature flags must point at real code or be `false`.** An
  `EXPO_PUBLIC_ADS_ENABLED=true` flag with no AdMob SDK wired does nothing but
  promise ads you can't deliver. Decide monetization explicitly; ship v1.0
  ad-free and add ads in v1.1 once there are users.
- **Privacy policy must be publicly reachable before review** — both stores fetch
  the URL. GitHub Pages is enough. Leftover `YOUR_USERNAME.github.io` /
  `[YOUR_EMAIL]` placeholders are an automatic rejection.

## Audio (for games / interactive apps)

From Lesen & Schreiben, which plays 660+ tiny syllable clips with zero perceived latency:

- **Use `expo-av`, not `expo-audio`, for low-latency overlapping playback.**
  `expo-audio` + `interruptionMode: 'duckOthers'` triggered ~200 ms OS-level
  ducking negotiation and dropped rapid taps. `expo-av` +
  `InterruptionModeIOS.MixWithOthers` sidesteps ducking entirely → zero-latency
  overlap.
- **Lazy LRU sound cache, not upfront load.** Loading 660 clips at launch costs
  50–100 MB. Recreating `Audio.Sound.createAsync()` per tap causes GC jitter.
  Instead: a `Record<string, Audio.Sound>` singleton; first tap loads async,
  later taps `replayAsync()` from RAM → native-feeling replay.
- Discrete `Audio.Sound` objects each play on their own channel → free
  multi-channel overlap (success jingle keeps playing while the user taps on).
- **TTS pre-generation gotchas:** when regex-extracting array elements, include an
  EOF alternative in the lookahead (`(?=[,\]]|$)`) or the **last** element is
  silently dropped. Cloud TTS (gTTS) mangles German loanwords ("Jac" → "Jack");
  support per-token phonetic overrides (`{ text: 'Jac', tts: 'Jak' }`).

## Docs & project hygiene

- **One STATUS doc, updated every session — and verify it before trusting it.**
  Stellarblox's `STATUS.md` went ~6 weeks stale: it claimed level configs were
  placeholders (30 real levels existed), `app.json` had a placeholder project ID
  (a real one was set), the ads flag was `true` (flipped to `false`), and legal
  placeholders were unfilled (all replaced). Stale docs cost more than no docs —
  always diff the doc against the code at the start of a session.
- **Archive legacy code, don't delete it mid-migration.** Move superseded files
  to `_legacy/`, exclude the folder in `tsconfig.json`, drop a `_legacy/README.md`
  explaining what/why. Keeps a reference (e.g. an old audio implementation worth
  porting) without polluting the active tree or the type-checker.
- **A single TS error blocks the production build.** The `type-check` CI gate
  exists for exactly this — keep it green; don't let "I'll fix it later" errors
  accumulate.

## Platform process

- **Google Play's 14-day / 12-tester closed test is the Android critical path.**
  New accounts can't reach Production without it, testers must *accept* invites,
  and the clock is 14 *continuous* days. Start it the moment a release build
  exists — see [RELEASE.md §3](./RELEASE.md). This rule has applied to every app
  shipped from this account so far.
