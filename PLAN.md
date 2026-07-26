# PLAN — Shiffle

Konzept: [concept.md](concept.md)
Specs: [docs/specs/](docs/specs/) — `tile-patterns.md`, `glyphen-world.md`, `training-mode.md`

> Der ursprüngliche Expo-Skeleton-Plan ist abgeschlossen und in den Skeleton-Specs
> archiviert ([docs/specs/expo-skeleton.md](docs/specs/expo-skeleton.md)). Dieser Plan
> beschreibt den **aktuellen Stand des Spiels Shiffle** und die noch offenen Aufgaben
> bis zum Store-Release.

## Aktueller Stand (Ist)

Stand: alle Quality-Gates grün (`just check`: lint + tsc strict + 125 Jest-Tests).

### Fertig ✅

| Bereich       | Status                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Engine        | `puzzle`, `shuffle` (seeded), `solvability`, `solver` (IDA\*), `patterns`, `tileLayout`              |
| Training      | `trainingPlan` + `useTrainingSession` + Coach/MoveArrow/GhostTarget                                  |
| Screens       | Home (World Map), World, Game, Settings, Training — alle verdrahtet                                  |
| Game-Features | Hints (1-/3-Step), Reference (off/pip/side/ghost), Confetti + CompletionModal, Pause, Timer, Haptics |
| Stores        | `gameStore`, `progressStore`, `settingsStore` (zustand persist / AsyncStorage)                       |
| Settings      | Haptics, Multi-Slide, Control-Mode, Reference-Default, Timer/Moves/Optimal, Tile-Numbers, Theme      |
| Daten         | **Natur** 9 (Bild) · **Muster** 15 (Pattern/SVG) · **Glyphen** 12 (Pattern/SVG) = 36 Levels          |
| Bild-Assets   | Natur: 3 AI-PNGs (lion/swans/kitten), je über 3 Grid-Größen. Muster/Glyphen: rein SVG                |
| Branding      | Icon/Adaptive/Splash/Favicon + Store-Icons + Feature-Graphic generiert (`tools/gen-icons.mjs`)       |
| Build-Config  | bundle id `com.shiffle.app` (iOS+Android), Icons + Splash vorhanden                                  |
| Tooling       | `tools/precompute_solver.py` vorhanden                                                               |

### MVP-Abgleich (concept.md §21)

Pflicht-Features (3×3–5×5, 2 Welten, ≥6 Pattern-Shapes, Tap+Swipe, Move/Timer,
Personal-Best, Hints, PiP, Celebration, Sterne, Unlock, Resume, Orientierung, Theme,
Haptics, Persistence, offline) — **alle umgesetzt**. Welt-Umfang übertrifft MVP (3 statt 2).

## Offene Aufgaben (To-Do bis Release)

### P1 — Nummern-genaue Lösung + `optimalMoves` backen ✅ (erledigt)

Spec: [docs/specs/numbered-solving.md](docs/specs/numbered-solving.md)

Zwei zusammenhängende Teile. **Phase A muss vor Phase B**, sonst werden falsche
Optimalwerte gebacken.

#### Phase A — Nummern respektieren bei Pattern-Levels ✅ (erledigt)

**Problem:** `usePuzzle` übergibt bei Pattern-Levels **immer** die `tileGroupMap`
an `isSolved` ([src/hooks/usePuzzle.ts:28](src/hooks/usePuzzle.ts#L28)). Wenn Nummern
sichtbar sind (Setting `tileNumbersVisible` **oder** `style: 'number'`), zählt damit
trotzdem jede Farb-Permutation als gelöst — obwohl der Spieler unterscheidbare
Nummern sieht. Inkonsistent.

**Aufgabe:** „Nummern sichtbar" → strikt numerischer Solved-State (= `tileGroupMap`
weglassen). Gilt für `isSolved`, `remainingMoves`/HUD, Hint-Solver und Sternewahl.
Implementierung braucht **keine** neue Solver-Logik — nur die `tileGroupMap`
konditional weglassen.

**Definition of Done:**

- Funktion: 2-Farben-Pattern, Nummern aus → Farb-Lösung gewinnt; Nummern an →
  nur exakte numerische Reihenfolge gewinnt; `style: 'number'`-Level → immer exakt.
- Tests: neue Tests für beide Modi in `tests/hooks/` + `tests/engine/`; bestehende
  Pattern-Tests bleiben grün.
- **Verify:** `just check` grün.

#### Phase B — `optimalMoves` für alle Fixed-Seed-Levels backen ✅ (erledigt)

> Erledigt: alle 39 Levels haben `optimalMoves`; 27 Pattern-Levels zusätzlich
> `optimalMovesPattern`. 12 große Levels (4×4/5×5, die IDA\* nicht exakt löste)
> tragen `optimalApprox: true` mit einem ehrlichen unteren Schranken­wert — dieser
> macht die 3-Sterne-Schwelle nur strenger, nie großzügiger. Pipeline:
> `npx tsx tools/dump-levels.ts > tools/levels-dump.json` (TS bleibt Source of Truth
> für PRNG/Shuffle/Pattern-Shapes) → `python3 tools/precompute_solver.py`.
> Heuristik: Manhattan + Linear-Conflict (numerisch) bzw. nearest-group-Manhattan
> (Farbe). Daten-Invariante getestet in `tests/data/optimalMoves.test.ts`.

<details><summary>Ursprüngliche Aufgabenbeschreibung</summary>

**Problem:** Nur **9 von 39** Levels haben einen pre-computed `optimalMoves`-Wert.
Ohne ihn ist die Sternebewertung (2× / 1.3× Optimal, concept.md §4.2) für ~30 Levels
ungenau oder zeigt nur „~".

**Aufgabe:** `tools/precompute_solver.py` über alle Fixed-Seed-Levels laufen lassen
(gleiche mulberry32-PRNG wie die App, concept.md §19) und nach `src/data/levels.ts`
zurückschreiben. Pro Pattern-Level **zwei** Werte (siehe Spec): `optimalMoves`
(numerisch/strikt) und `optimalMovesPattern` (Farbgruppen, ≤ numerisch). Image-Levels:
nur numerisch. 5×5+ ggf. als `~N` mit `approx: true`.

**Definition of Done:**

- Funktion: alle 39 Levels haben mindestens den numerischen `optimalMoves`; Pattern-
  Levels zusätzlich `optimalMovesPattern`.
- Tests: `computeStars` wählt den Wert passend zum aktiven Modus.
- **Verify:** `grep -c "optimalMoves:" src/data/levels.ts` == 39 · `just check` grün ·
  Manuell: 3-Sterne auf einem 3×3 bei optimalem Spiel erreichbar.

</details>

### P2 — Offene Konzept-Entscheidungen (concept.md §23) ⚪

- **Icon final?** Icons existieren — bestätigen, ob das der finale Entwurf ist.
- **Launch-Puzzle-Anzahl:** 39 vorhanden (Empfehlung war 24) → bereits erfüllt, nur bestätigen.

### P3 — Release-Vorbereitung (vor erstem EAS-Build) ⚪

- Store-Metadaten / Screenshots gegen den finalen Build prüfen (`store-assets/`).
- iOS Privacy Manifest / Android Data-Safety: „keine Daten erhoben" (concept.md §15, §18.2).
- W-8BEN / Steuerformulare in beiden Stores (einmalig).

## Feature: World Carousel (Kategorie-Slider) ✅ (erledigt)

> Erledigt: Home-Screen zeigt jetzt ein horizontales Snap-Karussell statt einer
> vertikalen Liste. Pro Welt ein gestyltes Cover (accentColor-Gradient + Mini-Puzzle-
> Motiv + Titel + `gelöst/gesamt` + `★ Sterne/max`), Nachbar-Parallax (Skalierung +
> Opazität) via Reanimated, animierte Pager-Dots, Reduce-Motion-Respekt
> (`useReduceMotion`). Selektor `worldProgress` als reine Funktion. Alte `WorldCard`
> entfernt. `just check` grün (133 Tests).

Spec: [docs/specs/world-carousel.md](docs/specs/world-carousel.md)

Die vertikale Welt-Liste auf dem Home-Screen wird ein horizontales Karussell mit
großem zentralem, gestyltem Cover pro Welt und Kategorie-Fortschritt
(gelöste Puzzles + Sterne). Smooth: Snap, Nachbar-Parallax, Pager-Dots.

### Struktur-Änderungen

| Datei                                          | Art    | Zweck                                                                                     |
| ---------------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| `src/store/selectors.ts` _(neu)_               | neu    | reine Funktion `worldProgress(records, world)` → `{ solvedCount, earnedStars, maxStars }` |
| `src/components/ui/WorldCoverCard.tsx` _(neu)_ | neu    | gestyltes Cover (Gradient + Mini-Puzzle-SVG + Titel + Fortschritt + Lock)                 |
| `src/components/ui/WorldCarousel.tsx` _(neu)_  | neu    | horizontaler Reanimated-Pager über `WORLDS` + Dots                                        |
| `src/app/index.tsx`                            | edit   | `WORLDS.map(WorldCard)` ⇒ `<WorldCarousel …/>`                                            |
| `src/components/ui/WorldCard.tsx`              | bleibt | (vorerst nicht entfernt; nach grünem Gate ggf. löschen)                                   |

### Phasen mit Stage-Gates

**Phase 1 — Daten/Selektor.** `worldProgress` als reine Funktion.

- _DoD Funktion:_ liefert korrektes `solvedCount` (stars>0), `earnedStars`, `maxStars`.
- _DoD Tests:_ `tests/store/selectors.test.ts` (leer / teilweise / voll gelöst).
- _Verify:_ `npm test -- tests/store/selectors.test.ts` grün.

**Phase 2 — `WorldCoverCard` (statisch).** Gestyltes Cover, noch ohne Karussell-Anim.

- _DoD Funktion:_ Gradient+SVG-Motiv+Titel+`solved/total`+`★ earned/max`; Lock-Zustand.
- _DoD Tests:_ `tests/components/ui/WorldCoverCard.test.tsx` (entsperrt/gesperrt, a11y).
- _Verify:_ `just check` grün.

**Phase 3 — `WorldCarousel` (Animation + Dots) + Home-Verdrahtung.**

- _DoD Funktion:_ horizontaler Snap-Pager; Nachbarn skaliert/gedämpft; Dots folgen;
  Tap der zentralen Karte navigiert; Reduce-Motion deaktiviert Parallax.
- _DoD Tests:_ `tests/app/home.test.tsx` rendert `WORLDS.length` Karten + Navigation.
- _Verify:_ `just check` grün; manuelles Wischen am Dev-Server.

**Phase 4 — Aufräumen.** Tote `WorldCard` entfernen, falls nirgends mehr genutzt.

- _DoD:_ `grep -r WorldCard src` leer (außer Carousel) oder bewusst behalten; `just check` grün.

## Feature: Worlds-Expansion + Per-World-Theming + Swipe-Fix + Unlock-Rebalance ✅ (erledigt)

> Erledigt: alle 5 Phasen, `just check` grün (159 Tests). Swipe gehärtet +
> `controlMode` (tap/swipe/both) verdrahtet; Unlock = kumulativ +5★ (0…35);
> `worldThemes.ts` (Gradient/Akzent/Frame + optionaler `backgroundImage`-Slot),
> `GameBackground` welt-bewusst; 8 Welten (Natur·Muster·Planeten·Fahrzeuge·
> Glyphen·Sport·Kosmos·Urban), 5 neue mit prozeduralen Platzhalter-Levels,
> optimalMoves frisch gebacken (67 Levels). `World.accentColor`/`totalLevels`
> entfernt (Single Source of Truth: Theme bzw. Selektor). Asset-Ordner +
> dokumentierte Registry-Seam für spätere echte PNGs.

Spec: [docs/specs/worlds-expansion.md](docs/specs/worlds-expansion.md)

Vier zusammenhängende Verbesserungen (gleiches Datenmodell, gleiche Screens):

1. **Swipe-Fix** — Kachel-per-Finger fühlt sich kaputt an (nur Tap geht). Swipe
   robuster machen **und** das `controlMode`-Setting (`tap`/`swipe`/`both`)
   endlich verdrahten — heute liest es niemand. Kein Live-Follow-Drag (bewusst).
2. **Per-World-Feeling** — pro Welt eigenes Theme-Token (Gradient, Akzent,
   Frame). Optionaler `backgroundImage`-Slot ins Datenmodell (für spätere
   organische Texturen), jetzt prozedural gerendert.
3. **Mehr Welten** — von 3 auf **8** Welten, je **5–9** Levels. Neue Welten mit
   **Platzhalter**-Quellen (prozedurale Pattern) + Asset-Ordner gescaffoldet.
4. **Unlock-Rebalance** — Gate auf **kumulativ +5 Sterne pro Welt** (0,5,…,35).

**Welt-Reihenfolge** (verschachtelt, Muster & Glyphen nicht nebeneinander):
Natur(0) · Muster(5) · Planeten(10) · Fahrzeuge(15) · Glyphen(20) · Sport(25) ·
Kosmos(30) · Urban(35).

### Struktur-Änderungen

| Datei                                                                   | Art  | Zweck                                                                 |
| ----------------------------------------------------------------------- | ---- | --------------------------------------------------------------------- |
| `src/data/worldThemes.ts` _(neu)_                                       | neu  | `WorldTheme`-Token pro Welt (Gradient/Akzent/Frame/opt. Bild)         |
| `src/data/worlds.ts`                                                    | edit | `theme` pro Welt; 5 neue Welten; Schwellen = `index*5`                |
| `src/data/levels.ts`                                                    | edit | Platzhalter-Levels (Pattern) für die 5 neuen Welten                   |
| `src/data/images.ts`                                                    | edit | Registry-Seam: Platzhalter-Welten → prozedural; PNG-Slot dokumentiert |
| `src/components/ui/GameBackground.tsx`                                  | edit | optional `world`-Prop → welt-spezifischer Gradient                    |
| `src/components/ui/WorldCoverCard.tsx`                                  | edit | Frame/Border aus `theme`                                              |
| `src/components/puzzle/PuzzleBoard.tsx`                                 | edit | `controlMode`-Prop; Gesten-Auswahl tap/swipe/both; Swipe gehärtet     |
| `src/app/game/[id].tsx`                                                 | edit | `controlMode` + `world.theme` durchreichen                            |
| `src/app/world/[id].tsx`, `src/app/worlds.tsx`                          | edit | welt-spezifischen Hintergrund nutzen                                  |
| `assets/images/worlds/{planeten,fahrzeuge,sport,kosmos,urban}/.gitkeep` | neu  | Asset-Ordner-Scaffold (PNGs liefert der User später)                  |

### Phasen mit Stage-Gates

**Phase 1 — Swipe-Fix + `controlMode` verdrahten.** _(unabhängig, zuerst — schnellster Win)_

- _DoD Funktion:_ Swipe schiebt eine Kachel Richtung Lücke zuverlässig;
  `controlMode=tap` deaktiviert Swipe, `=swipe` deaktiviert Tap, `=both` beides;
  falsche Richtung → Shake (unverändert).
- _DoD Tests:_ `tests/components/puzzle/PuzzleBoard.test.tsx` deckt Gesten-Auswahl
  je Modus ab; bestehende Puzzle-Tests bleiben grün.
- _Verify:_ `just check` grün + manuelles Wischen am Dev-Server (Beweis im PR).

**Phase 2 — Unlock-Rebalance.** _(Daten-only, isoliert)_

- _DoD Funktion:_ Schwellen = `[0,5,10,15,20,25,30,35]`; `worldsUnlockedBy`
  unverändert korrekt.
- _DoD Tests:_ `tests/store/progressStore.test.ts` + Daten-Invariante (Schwellen
  monoton, Schritt 5).
- _Verify:_ `npm test -- tests/store/progressStore.test.ts` grün.

**Phase 3 — Per-World-Theme-Token + welt-bewusster Hintergrund.**

- _DoD Funktion:_ `worldThemes.ts` liefert pro Welt Gradient/Akzent/Frame +
  optionalen `backgroundImage`-Slot; `GameBackground` rendert je Welt einen
  eigenen Gradient; `WorldCoverCard`-Frame stammt aus dem Theme.
- _DoD Tests:_ `tests/data/worldThemes.test.ts` (jede Welt hat vollständiges
  Theme); `GameBackground` rendert mit/ohne `world`-Prop.
- _Verify:_ `just check` grün; Screenshot zweier Welten mit sichtbar
  unterschiedlichem Look.

**Phase 4 — 5 neue Welten + Platzhalter-Levels + Ordner/Registry.**

- _DoD Funktion:_ `WORLDS.length === 8`; jede Welt 5–9 Levels; alle Quellen
  auflösbar (Platzhalter prozedural, kein fehlender `require`); Menü/Karussell
  zeigt 8 Welten mit korrekten Locks.
- _DoD Tests:_ Daten-Invariante in `tests/data/` (Anzahl Welten, 5–9 Levels je
  Welt, `getLevelsForWorld` non-empty, Quellen auflösbar); `tests/app/worlds.test.tsx`
  rendert 8 Karten.
- _Verify:_ `just check` grün; Karussell durchwischbar, neue Welten gesperrt bis
  Schwelle erreicht.

**Phase 5 — Aufräumen + Doku.**

- _DoD:_ `accentColor`-Altfeld migriert/entfernt; README/Concept-Hinweis, wie ein
  echtes PNG je Welt eingehängt wird (ein-Zeilen-Registry-Eintrag); `just check` grün.

## Feature: Sound + Musik 🟡 (App-Engine implementiert, Assets warten auf manuelle Review — Spec: [docs/specs/sound-and-music.md](docs/specs/sound-and-music.md))

Aktuell existiert keine Audio-Ebene — nur `expo-haptics` (Tile-Move, Invalid-Move,
Win). Diese Feature fügt ein echtes SFX- + Ambient-Musik-System hinzu, verdrahtet an
jeden bestehenden Haptic-Touchpoint, plus einen loopenden Ambient-Bed pro Welt,
steuerbar über zwei neue unabhängige Settings-Toggles (`soundEnabled`,
`musicEnabled`). Asset-Erzeugung läuft getrennt über `assetgen/sounds.yaml` (14 SFX +
9 Welt-Ambiences via Stable Audio Open 1.0) — aktuell **blockiert**, da der
HuggingFace-Account hinter `HF_TOKEN` die Lizenz auf `stabilityai/stable-audio-open-1.0`
(gated repo, 403 `GatedRepoError`) noch nicht akzeptiert hat. Das App-seitige Engine
muss deshalb korrekt ohne echte Dateien funktionieren (alle `assetMap`-Einträge
`undefined` → no-op statt Crash) und automatisch aktivieren, sobald echte Dateien +
Map-Einträge nachgereicht werden.

### Struktur-Änderungen

- Neue Dependency: `expo-audio` (via `npx expo install expo-audio`, SDK-54-Version).
- Neues Modul `src/audio/`: `assetMap.ts` (statische `require()`-Maps, initial alle
  `undefined`), `soundEffects.ts` (Preload + `playSound(name)`, no-op bei fehlendem
  Asset oder `soundEnabled: false`), `musicPlayer.ts` (`playWorldMusic(worldId)` /
  `stopMusic()`, Cross-Fade ~600ms, no-op bei fehlendem Asset oder
  `musicEnabled: false`).
- `src/store/settingsStore.ts`: `soundEnabled`, `musicEnabled` (beide Default `true`).
- Landing-Zone für echte Binaries (design-owned, nicht Teil dieser Implementierung):
  `assets/audio/sfx/`, `assets/audio/music/`.

### Phasen mit Stage-Gates

**Phase 1 — Dependency + Settings + leeres Audio-Modul.**

- _DoD (Funktionalität):_ `expo-audio` installiert; `soundEnabled`/`musicEnabled` in
  `settingsStore` + zwei neue `SwitchRow`s in `settings/index.tsx` ("Sound", "Musik");
  `src/audio/assetMap.ts` mit vollständiger `SoundEffectName`-Union (14 Namen aus
  `assetgen/sounds.yaml`) und Welt-Musik-Map, beide komplett `undefined`.
- _DoD (Tests):_ `tests/store/settingsStore.test.ts` erweitert (neue Keys +
  Persistenz); `tests/app/settings.test.tsx` erweitert (neue Switches rendern +
  toggeln).
- _Verify:_ `npm test -- tests/store/settingsStore.test.ts tests/app/settings.test.tsx`

**Phase 2 — `soundEffects.ts` + `musicPlayer.ts` (Engine, noch nicht verdrahtet).**

- _DoD (Funktionalität):_ `playSound(name)` und `playWorldMusic(worldId)` /
  `stopMusic()` implementiert; beide lesen `soundEnabled`/`musicEnabled` aus dem
  Store; beide no-open (warn-once via `console.warn`, kein Throw) bei
  `undefined`-Map-Eintrag.
- _DoD (Tests):_ `tests/audio/soundEffects.test.ts`, `tests/audio/musicPlayer.test.ts`
  — `expo-audio` an der Grenze gemockt (kein echtes Audio in Jest), Assertions für:
  no-op bei disabled Setting, no-op bei fehlendem Asset, Aufruf der
  Player-API bei enabled + vorhandenem Asset.
- _Verify:_ `npm test -- tests/audio`

**Phase 3 — Verdrahtung in bestehende Touchpoints.**

- _DoD (Funktionalität):_ `playSound(...)` ergänzt (nie ersetzt) an jedem Haptic-Call:
  `PuzzleBoard.tsx` (tile-slide/tile-invalid), `CompletionModal.tsx`
  (level-complete-fanfare, new-best-record, star-earned), Confetti-Trigger in
  `game/[id].tsx` (confetti-burst), `handleHint` (hint-reveal), Welt-/Level-Unlock in
  `worlds.tsx`/`world/[id].tsx`, `GameButton`-Press (button-tap) + Zurück-Pressables
  (nav-back), Pause-Modal open/close (modal-open/modal-close),
  `training/[lesson].tsx` Schritt-Abschluss (training-step-complete).
  `playWorldMusic`/`stopMusic` an World-/Game-Screen Mount/Unmount.
- _DoD (Tests):_ bestehende Komponententests bleiben grün (Sound-Calls sind
  Zusatzaufrufe, keine Verhaltensänderung); keine neuen Snapshot-Brüche.
- _Verify:_ `just check` grün; manueller Durchlauf (siehe unten).

**Phase 4 — Aufräumen + Doku.** ✅ (erledigt)

- _DoD:_ `assets/audio/sfx/.gitkeep`, `assets/audio/music/.gitkeep` angelegt;
  PLAN.md-Eintrag auf ✅ aktualisiert sobald echte Assets eingehängt sind (separater
  Schritt, sobald `assetgen`-Batch nach HF-Lizenz-Freischaltung durchläuft).

**Status:** Phasen 1–4 umgesetzt, `just check` grün (36 Suites, 215 Tests). Der
`assetgen`-Batch lief erfolgreich durch (HF-Lizenz wurde freigegeben) — 23 Assets ×
2 Kandidaten = 46 Klänge liegen in `assetgen/.assetgen-staging/audio/<name>/candidate-N.mp3`,
`ingest-audio.mjs` bestätigt korrekte Dauer für alle 46 (Welt-Ambiences auf 47s
nachgezogen — Stable Audio Open 1.0s harte Obergrenze, ursprünglich 30s). Auf
expliziten Wunsch ist **`candidate-1` je Asset bereits als Platzhalter-Default
eingehängt** — alle 14 SFX in `assets/audio/sfx/`, alle 9 Welt-Ambiences in
`assets/audio/music/`, beide in `src/audio/assetMap.ts` per `require()`
registriert. Die App spielt damit bereits echten (wenn auch ungehört/nicht
kuratierten) Sound. **Offen:** finale Auswahl der Kandidaten aus dem Spiel heraus
(Nutzerwunsch, für später) — laut `docs/AUDIO.md` kann kein Tool beurteilen, ob ein
Klang tatsächlich passt, nur Dauer/Stille. `world-unlock`/`level-unlock` haben
reale Dateien registriert, sind aber noch nirgends verdrahtet — beide Screens
leiten den Unlock-Status nur aus `records`/`unlockedWorldIds` beim Rendern ab, es
gibt noch keinen expliziten "gerade freigeschaltet"-Übergang zum Anhängen eines
Einmal-Sounds (siehe Spec-Abschnitt Non-Goals-Ergänzung).

### Verifikation (alle Phasen)

```
just check    # lint + tsc --noEmit (strict) + jest
```

Manuell: bei beiden Settings an, aber **ohne** echte Audiodateien einen Level
komplett durchspielen (Move, Invalid-Move, Hint, Win) — kein Crash, nur erwartete
einmalige "asset missing"-Warnungen. Sobald echte Dateien vorhanden sind: gleicher
Durchlauf, jetzt mit hörbarem Sound je Touchpoint und sauberem Cross-Fade beim
Wechsel World-Screen → Game-Screen.

## Verifikationskommando (alle Phasen)

```
just check    # lint + tsc --noEmit (strict) + jest
```
