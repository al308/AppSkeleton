# Lessons Learned — shipping Expo apps with Claude Code

> Hard-won, cross-app knowledge that isn't obvious from the code or the Expo docs.
> Sources: **Lesen & Schreiben** (live in stores), **Stellarblox** (Block-Blast
> game, submit-ready) and **Harbor Chaos** (sliding-block puzzle, Reanimated +
> gestures + expo-router stack). Add to this as each new app teaches you something
> — it's the compounding asset that makes app N+1 faster than app N. Keep entries
> app-agnostic: write the rule and the trap, not the level/feature it came from.
>
> Operational store steps live in [RELEASE.md](./RELEASE.md); this doc is the _why_.

---

## EAS & credentials

- **Don't hardcode Apple credentials in `eas.json`.** Signing certs, provisioning
  profiles and the Android keystore are generated and stored **by EAS under your
  account** (`owner` in `app.json`). Keep `submit.production` as `{}` and let EAS
  resolve the real `appleId` / `ascAppId` / `appleTeamId` interactively at submit
  time. Stellarblox shipped with `YOUR_APPLE_ID@example.com` placeholders for weeks
  — a non-blocker that _looked_ like a blocker. The live app (Lesen & Schreiben)
  has an empty `submit.production` and works fine.
- **`appVersionSource: "remote"` + `autoIncrement: true`** on the production
  profile means EAS owns the build number. You never bump `buildNumber` /
  `versionCode` by hand — only the user-facing `version`.
- One EAS account ships many apps; the `projectId` (`eas init`) is per-app, the
  credentials store is per-account.

## Store & metadata

- **Validate store copy against the actual mechanics.** Stellarblox's first store
  text described "falling blocks", "rotate", "stack reaches the top" — it's a
  _Block-Blast_ game (drag-and-drop, no gravity, no rotation). Copy drifts from
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

## Animated UI, gestures & navigation stack

For any app reaching for Reanimated, Gesture Handler, expo-router or Zustand —
these bit on the first app that used them and are pure setup tax, not app logic.

- **Reanimated 4 needs `react-native-worklets` as a separate install.** `npx expo
install react-native-reanimated` alone fails `ERESOLVE` on SDK 54 — the worklets
  plugin was split into its own package. Install both: `npx expo install
react-native-reanimated react-native-worklets`. The babel plugin also moved:
  it's now `react-native-worklets/plugin` (last in `babel.config.js`), **not**
  `react-native-reanimated/plugin`.
- **Mock Reanimated / Gesture Handler at the boundary in Jest, don't load them.**
  Under `jest-expo` (CommonJS), `require('react-native-reanimated/.../mock')`
  throws `Unexpected token 'typeof'` — the shipped entry points are ESM/TS. A
  small `jest.mock()` in `jest.setup.js` returning pass-through `useSharedValue` /
  `useAnimatedStyle` / `withX` and a chainable `Gesture.Pan` is enough; component
  tests assert layout + state, not animation. Wire it via `package.json`
  `jest.setupFilesAfterEnv`, and give that one file jest/node globals through an
  eslint override.
- **AsyncStorage ships an official in-memory Jest mock.** `jest.mock(pkg, () =>
require('@react-native-async-storage/async-storage/jest/async-storage-mock'))`
  in `jest.setup.js` gives real round-trip behaviour (persist → load) for free —
  far better than hand-rolling `jest.fn()`s; persistence tests read like the real
  thing.
- **expo-router: keep only the `GestureHandlerRootView` import, drop the bare
  side-effect line.** The recommended `import 'react-native-gesture-handler';`
  plus the named `GestureHandlerRootView` import trips eslint
  `import/no-duplicates`. In the router root layout the named import already loads
  the module before anything renders, so the bare line is redundant.
- **expo-router pulls `react-dom` as an optional web peer — pin it to the SDK
  react.** It auto-resolves the newest `react-dom` (e.g. `19.2.x`), which then
  demands a newer `react` than the SDK pins (`19.1.0`) and `ERESOLVE`s — typically
  surfacing only when you later add another dep. `npx expo install react-dom`
  pins it to the SDK react; add it to deps so `npm ci` (and EAS) stay clean. This
  is the generic "transitive peer too new" trap, just the most common instance.
- **Zustand: subscribe to data, never to a store _method_.** Selecting a function
  like `state.isUnlocked` returns a stable reference, so the component never
  re-renders when the underlying data changes. Select the array/value and compute
  the predicate in render.

## TypeScript strict gotchas

The skeleton's `tsconfig` keeps `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes` on; both produce errors that read cryptically the
first time.

- **`exactOptionalPropertyTypes` forbids passing `undefined` to an optional
  prop.** `<W best={maybe} />` where `maybe: number | undefined` fails against
  `best?: number`. Spread it conditionally instead: `{...(maybe !== undefined ? {
best: maybe } : {})}`.
- **Jest's `toBe(0)` rejects `-0`.** `Math.round` of a small negative number
  yields `-0`, and `Object.is(-0, 0)` is false, so `expect(fn(...)).toBe(0)`
  fails cryptically. Normalize at the seam where the value is produced:
  `x === 0 ? 0 : x`.

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
- **Validate an entry/router restructure with `expo export`, not just tests.**
  Lint, typecheck and Jest can all pass while the app still fails at Metro bundle
  time (entry resolution, asset `require`, transform order) — restructuring
  `package.json main`, adding `app/` routes, or moving the root component are
  exactly the changes that slip past unit tests. A headless `npx expo export
--platform ios` bundles the real entry and is the cheapest proof the app
  actually boots. `babel-preset-expo` handles the expo-router transform — no
  separate babel plugin needed.
- **Trim the EAS build tarball with `.easignore`.** Store assets, docs, the
  marketing site, tests and `*.p8` keys don't belong in the uploaded build
  context. An `.easignore` (same syntax as `.gitignore`) keeps uploads small and
  keeps secrets out of the tarball even when they're present locally.

## Platform process

- **Google Play's 14-day / 12-tester closed test is the Android critical path.**
  New accounts can't reach Production without it, testers must _accept_ invites,
  and the clock is 14 _continuous_ days. Start it the moment a release build
  exists — see [RELEASE.md §3](./RELEASE.md). This rule has applied to every app
  shipped from this account so far.
- **The Play service-account key is a `.json` — the generic credential globs
  don't catch it.** `eas submit -p android` authenticates with a Google service
  account key (Apple's EAS-managed `.p8` has no Android equivalent). The file is
  named like `*.json`, so `*.p8`/`*.key`/`*.jks` in `.gitignore` miss it entirely
  — add an explicit `play-service-account.json` ignore line _before_ dropping the
  key in, or you'll commit a private key. One key can submit every app under the
  same Play developer account (the app binding lives in Play Console → API access,
  not in the key's GCP project). See [STORE_PLAYBOOK.md](./STORE_PLAYBOOK.md).

## Store automation (fastlane / App Store Connect)

Operational detail lives in [STORE_PLAYBOOK.md](./STORE_PLAYBOOK.md); the traps:

- **The ASC API cannot create apps.** `fastlane create_app` (produce) dies with
  `No value found for 'username'` because the API has no create-app endpoint and
  falls back to Apple-ID auth. Create the app once in the ASC UI, _then_
  `fastlane ios metadata` uploads text + screenshots fine with just an API key.
- **Verify against the source of truth, not scrollback.** fastlane/deliver logs
  are noisy and easy to misread as success. `fastlane/scripts/asc-status.rb`
  queries the ASC API directly and answers "did it actually upload?". A CLI exit
  code or terminal output can lie — this bit twice in one session.
- **Pass `api_key:` explicitly to deliver.** Relying on lane_context alone let it
  fall back to legacy auth and fail with `team_id nil`.
- **EAS "Install dependencies" failures = `npm ci` choking.** Reproduce locally
  with `npm ci`. Causes: lockfile out of sync (`npm install`, commit it) or a
  transitive peer pulling a too-new version (e.g. `react-dom@19.2` vs the SDK's
  `react@19.1.0` — pin with `npx expo install`).
- **Screenshots: right slot + no alpha.** 1320×2868 is _6.9"_ (the only required
  size; ASC downscales for smaller phones), not 6.5". Flatten all store images.
- **Bundle id is permanent** once the app exists in either store. Set `app.json`
  (iOS + Android identical) before the first build; `ios`/`android` regenerate
  from it. **And it's not the SKU** — if the record already exists, read the
  _registered_ bundle id off ASC (or `asc-status.rb`) and match config to it.
  deliver looks the app up by bundle id; a mismatch is the real cause of the
  `team_id nil` crash in `find_app`.
- **No emoji in description / release notes.** Apple rejects them outright
  (`Description can't contain the following character(s): …`). `×`, `—`, `•` are
  fine; 🧩 ⭐ 🌌 are not.
- **Keep `fastlane/` in `.prettierignore`.** Every deliver run regenerates
  `fastlane/README.md` (and may touch `metadata/*.txt`); if it's not ignored, the
  tree reads "unformatted" and blocks the next commit. A port that drops this
  entry will fight the format hook on every store run.
- **One `git commit` per step.** Batching a commit with other tool calls means a
  failing pre-commit hook cancels the whole batch and you misread stale output.
