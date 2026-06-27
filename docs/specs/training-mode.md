# Spec: Trainingsmodus ("Lernen zu lösen")

## 1. Outcome

Ein optionaler, geführter Trainingsmodus, der dem Spieler das etablierte
**Row-by-Row-Lösungsschema** für Schiebepuzzles beibringt. Der Modus führt
Schritt für Schritt durch zwei kurze Beispielpuzzles und erklärt jede Phase des
Schemas mit Text und visuellen Bewegungs-Hinweisen.

Erfolg = ein neuer Spieler versteht nach dem Durchlauf, wie man ein
Schiebepuzzle systematisch löst (obere Reihe → linke Spalte → kleineres
Restfeld → letzter 2×2-Block), statt planlos zu schieben.

## 2. Hintergrund — das vermittelte Schema

Quelle: gängige Schiebepuzzle-Lösungsanleitungen (Row-by-Row-Methode).

- [HowStuffWorks — Solving Sliding Puzzles](https://entertainment.howstuffworks.com/puzzles/sliding-puzzles3.htm)
- [Speedsolving Wiki — 15 puzzle](https://www.speedsolving.com/wiki/index.php?title=15_puzzle)
- [ruwix — Sliding 15-Puzzle](https://ruwix.com/twisty-puzzles/sliding-15-puzzle/)

**Schema-Phasen:**

1. **Obere Reihe lösen.** Kacheln der Reihe nach setzen. Kritische Technik: die
   letzten beiden Kacheln einer Reihe werden **zusammen** platziert (Eck-Trick),
   sonst blockieren sie sich gegenseitig.
2. **Linke Spalte lösen.** Dasselbe Prinzip vertikal.
3. **Reduktion.** Nach einer gelösten Reihe + Spalte ist das Problem auf ein
   (n-1)×(n-1)-Feld geschrumpft — der zentrale Aha-Moment. Phasen 1–2 wiederholen.
4. **Letzter 2×2-Block.** Nur noch Rotation im Kreis; hier wird auch Parität
   kurz angesprochen (warum manchmal eine zusätzliche Kreisbewegung nötig ist).

## 3. Scope

### In Scope (v1 dieses Features)

- Zwei geführte Lektionen:
  - **Lektion A — 3×3**, in **≤ 10 Zügen** komplett nach Schema lösbar
    (fester Seed, vorberechneter optimaler Pfad). Durchläuft das ganze Schema
    einmal in Kurzform.
  - **Lektion B — 4×4**, vertieft Row-by-Row auf dem klassischen 15-Puzzle.
- **Voll geführter** Ablauf:
  - Optimaler Pfad kommt aus dem vorhandenen Solver (`src/engine/solver.ts`).
  - Pro Phase erklärender Text (Coachmark-Leiste) + Bewegungs-Hinweis.
  - Falsche Züge werden sanft abgefangen (Shake + Hinweis, kein Fortschritt-
    Reset, kein "verloren").
  - Schritt-/Phasen-Fortschrittsanzeige.
- **Bewegungs-UI: Pfeil + Ghost-Ziel**
  - Pulsierender Overlay-Pfeil auf der zu schiebenden Kachel, zeigt Richtung Lücke.
  - Halbtransparenter Geist-Umriss am Zielfeld der Kachel.
- Eigener Einstieg auf dem Home-Screen ("Training"), jederzeit wiederholbar.
- Funktioniert wie der Rest: offline, lokal, keine Netzwerkaufrufe.

### Out of Scope (später / nicht jetzt)

- Gleitende Geister-Kachel-Pfadanimation für Mehrfach-Züge (nur als spätere
  Verfeinerung notiert).
- Trainingslektionen für 5×5+.
- Belohnungen/Sterne für den Trainingsmodus (rein didaktisch, keine Progression).
- Sound (folgt globaler v2-Entscheidung).
- Mehrsprachigkeit über Deutsch hinaus.

## 4. Constraints

- TypeScript `strict`, keine `any` über Modulgrenzen (Projektregeln).
- Maximale Wiederverwendung der bestehenden Engine/Komponenten:
  - `src/engine/solver.ts` für den optimalen Pfad.
  - `src/components/puzzle/PuzzleBoard.tsx` / `PuzzleTile.tsx` für das Board.
  - `src/hooks/usePuzzle.ts` für die Spiel-Loop, falls passend ableitbar.
  - Animationen via vorhandenem `react-native-reanimated`.
- Der Trainingsmodus ist eine **geführte Schicht über** der Engine — keine
  Änderung an Move-Validierung, Win-Detection oder Solver-Kernlogik.
- `assets/`-Binärdateien werden nicht angefasst; alle Visuals via SVG/Reanimated
  oder bestehende Pattern-Renderer.
- Reduced-Motion respektieren (§16): bei aktivem Reduce-Motion Pfeil/Ghost statisch.

## 5. Task-Breakdown (grob — Details im PLAN.md)

1. **Trainingsdaten & Pfad.** Zwei feste Trainings-Level (3×3, 4×4) mit Seed
   definieren; optimalen Pfad pro Level aus dem Solver gewinnen; das 3×3 so
   wählen, dass es ≤ 10 Züge braucht.
2. **Phasen-Annotation.** Den optimalen Zug-Pfad in Schema-Phasen gruppieren
   (obere Reihe / linke Spalte / Reduktion / letzter Block) inkl. Erklärtext.
3. **Geführte Spiel-Loop.** Hook/Controller, der den nächsten erwarteten Zug
   kennt, falsche Züge abfängt und Phasen-Fortschritt führt.
4. **Bewegungs-UI.** Overlay-Pfeil-Komponente (pulsierend, Richtung Lücke) +
   Ghost-Ziel-Umriss; Reduced-Motion-Fallback.
5. **Coachmark/Phasen-Leiste.** Texte + Fortschritt, "Weiter"-Logik.
6. **Home-Einstieg & Screen.** "Training"-Eintrag + Trainings-Screen, der zwischen
   Lektion A und B führt.
7. **Tests.** Engine-nahe Logik (Phasen-Gruppierung, erwarteter-Zug-Abgleich,
   3×3-≤10-Züge-Garantie) als Unit-Tests; Controller-Verhalten testen.

## 6. Verification Criteria

- **Engine/Logik (Unit, `tests/`):**
  - Das 3×3-Trainings-Level ist mit dem Solver in **≤ 10 Zügen** lösbar (Test schlägt
    fehl, falls der Seed das verletzt).
  - Phasen-Gruppierung deckt jeden Zug des optimalen Pfads genau einer Phase zu
    (keine Lücke, keine Überlappung).
  - Falscher Zug → Controller bleibt in derselben Phase/Schritt; richtiger Zug →
    rückt vor.
- **UI/Verhalten (Component, `@testing-library/react-native`):**
  - Pfeil + Ghost werden für den jeweils erwarteten Zug gerendert.
  - Coachmark zeigt den Phasentext der aktuellen Phase.
- **Manuell:** Trainings-Screen einmal durchspielen (Lektion A + B), Pfeile/Ghost
  sichtbar, Erklärtexte korrekt, Abschluss-Zustand erreicht.
- `just check` grün vor Commit.

## 7. Umgesetzte Entscheidungen

- **Schema statt Optimal-Pfad:** Der move-optimale Solver springt zwischen Regionen
  und ist nicht lehrbar. Stattdessen löst `trainingPlan.ts` in festen Stufen (obere
  Reihe → … → letzter Block) per stufenweiser BFS. Jeder Zug gehört genau einer Phase.
- **Feste Start-Arrangements statt Shuffle-Seeds:** Lektionen liefern explizite
  `startTiles`, damit sie unabhängig von Shuffle-Interna deterministisch sind.
  - Lektion A (3×3): `[5,1,3,4,2,6,7,8,0]` → 10 Züge, Phasen Reihe/Spalte/Rest.
  - Lektion B (4×4): `[0,1,2,3,5,7,8,4,10,6,15,11,9,13,14,12]` → 14 Züge, alle 4 Phasen.
    Beide sind via Engine-`isSolvable` als lösbar verifiziert (Test).
- **Falsche Züge:** strikt blockiert — `useTrainingSession.tryMove` führt nur den
  erwarteten Zug aus; jeder andere gibt `false` zurück → Board zeigt seinen Standard-
  Shake. Der Spieler bleibt immer auf dem Lehrpfad, der Phasentext bleibt korrekt.
- **Bewegungs-UI:** `MoveArrow` (pulsierender Chevron Richtung Lücke, Reduced-Motion-
  Fallback) + `GhostTarget` (gestricheltes Ziel-Feld; erscheint nur, wenn die Kachel
  tatsächlich umzieht — in Lektion A bei 7/10 Zügen).
