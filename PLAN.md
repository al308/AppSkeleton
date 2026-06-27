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

## Verifikationskommando (alle Phasen)

```
just check    # lint + tsc --noEmit (strict) + jest
```
