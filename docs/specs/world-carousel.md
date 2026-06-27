# Spec — World Carousel (Kategorie-Slider)

## Outcome

Die Welt-Auswahl auf dem Home-Screen ([src/app/index.tsx](../../src/app/index.tsx))
wird von einer vertikalen Liste von `WorldCard`s zu einem **horizontalen Karussell**
umgebaut: eine Welt steht groß und zentral im Fokus, Nachbarwelten lugen an den
Rändern hervor. Jede Welt-Karte zeigt ein **gestyltes Cover** (kein Bild-Asset) und
den **Lösungs-Fortschritt der Kategorie** (wie viele Puzzles gelöst, plus Sterne).
Das Wischen fühlt sich „smooth" an: Snap pro Karte, gedämpfte Skalierung/Opazität
der Nachbarn, sanfte Pager-Dots.

## Scope

**In scope**

- Neue Komponente `WorldCarousel` (horizontaler, snappender Pager über `WORLDS`).
- Neue Komponente `WorldCoverCard` — das gestylte Cover pro Welt:
  - accentColor-Gradient-Hintergrund,
  - kleines „Mini-Puzzle"-Motiv (SVG, aus `react-native-svg`),
  - Welttitel + Untertitel,
  - **Fortschritt**: `gelöste Puzzles / gesamt` der Kategorie **und** `★ Sterne / max`,
  - Lock-Zustand (gesperrte Welt: abgedunkelt, Schloss, Unlock-Schwelle als Hinweis).
- Fokus-/Nachbar-Animation (zentrale Karte 100 %, Nachbarn skaliert/abgedunkelt) via
  Reanimated `useAnimatedScrollHandler` + `interpolate`.
- Pager-Dots unter dem Karussell, aktive Welt hervorgehoben.
- `progressStore`: Ableitung „Anzahl gelöster Levels pro Welt" (ein Level gilt als
  gelöst, wenn `records[levelId]?.stars > 0`). Falls noch kein Selektor existiert,
  als reine Funktion ergänzen (kein neuer State).
- Reduce-Motion-Respekt: bei aktivem System-Setting Snap ohne Skalierungs-Parallax.

**Out of scope**

- Echte Foto-/Bild-Cover-Assets (bewusst gestyltes Cover, siehe Entscheidung).
- Änderungen am World-Detail-Screen (`world/[id].tsx`) und am Game-Screen.
- Training-Card-Eintrag bleibt unverändert über dem Karussell.
- Neue Persistenz-Felder.

## Constraints

- TypeScript strict, keine `any` über Modulgrenzen. Exporte mit Rückgabetyp.
- Reuse: Theme-Token aus [src/constants/theme.ts](../../src/constants/theme.ts)
  (`Game`, `Spacing`, `Radii`, `Typography`). Kein neues Farb-Vokabular.
- Animationen über das bereits genutzte Reanimated v4. Kein neues Dependency.
- `StyleSheet.create`, keine frische Style-Objekte im Render-Pfad.
- A11y: jede Welt-Karte bleibt ein `accessibilityRole="button"` mit Label
  (Titel + Fortschritt) und `accessibilityState.disabled` für gesperrte Welten.
- Komponenten < ~150 Zeilen; Subviews auslagern.

## Data

`World` ([src/data/worlds.ts](../../src/data/worlds.ts)) bleibt unverändert
(`id, title, description, accentColor, unlockStarThreshold, totalLevels`).
Pro Welt abgeleitet:

- `solvedCount = levels.filter(l => (records[l.id]?.stars ?? 0) > 0).length`
- `earnedStars = Σ records[l.id]?.stars` (existiert schon in `index.tsx`)
- `maxStars = totalLevels * 3`

## Verification

- **Unit**: `tests/components/ui/WorldCoverCard.test.tsx`
  - rendert Titel + `solved/total` + `★ earned/max` für eine entsperrte Welt;
  - zeigt Lock-Zustand + Unlock-Schwelle bei gesperrter Welt;
  - `accessibilityState.disabled` korrekt gesetzt.
- **Unit**: Progress-Selektor (`solvedCount`) — eigener Test in
  `tests/store/progressStore.test.ts` (oder bei der Cover-Karte mitgetestet, falls
  als reine Funktion).
- **Unit**: `tests/app/home.test.tsx` — Home rendert genau `WORLDS.length` Welt-Karten
  und reagiert auf Tap der zentralen Karte mit Navigation `/world/<id>`.
- **Gate**: `just check` grün (lint + tsc strict + jest).
- **Manuell**: auf dem Dev-Server wischen — Snap pro Welt, Nachbarn gedämpft,
  Dots folgen.

## Task breakdown

Siehe [PLAN.md](../../PLAN.md) → Feature „World Carousel".
