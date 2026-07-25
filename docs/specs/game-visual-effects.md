# Game-Screen: visuelle Effekte + Tension-Chrome + abschaltbar

## Outcome

Der Spielbildschirm (`src/app/game/[id].tsx`) bekommt spürbares, aber dezentes visuelles Feedback:

1. Kacheln gleiten beim Zug statt zu snappen.
2. Die leere Zelle pulsiert sanft (Glow).
3. Der aktive Hint-Tile pulsiert statt nur statischer Border.
4. Je näher der Spieler am Ziel ist (verbleibende Schritte), desto lebendiger werden Hintergrund-Gradient und Board-Glow ("Tension-Chrome") — Schwellen bei 20 / 10 / 5 verbleibenden Zügen.
5. Der Sieg-Moment wird stärker inszeniert (Ausbaustufe auf Basis von `ConfettiEmitter`/`CompletionModal`).

Alles ist über einen einzigen neuen Settings-Toggle `visualEffectsEnabled` deaktivierbar und respektiert `reduceMotion` genauso wie die bestehende Konfetti-Logik.

## Scope

### Trigger-Basis für Tension-Chrome

- Nutzt ausschließlich `remaining: RemainingEstimate` aus `remainingMoves()` (`src/engine/solver.ts`), wie bereits in `[id].tsx:82-85` berechnet.
- `RemainingEstimate` unterscheidet exakte Werte von Lower-Bound-Schätzungen (`≥N`) und dem versteckten Fall (`hidesEstimate`, Pattern-Level ohne exact order). **Nur der exakte Fall triggert die Eskalation.** Bei `≥N` oder versteckter Distanz bleibt das Chrome auf der neutralen Baseline — kein Trigger auf Basis von `moveCount`/`optimalMoves` als Fallback (das wäre eine andere Metrik und für diesen Spec explizit out of scope).
- Neue Hilfsfunktion `tensionLevelFor(remaining: RemainingEstimate): 0 | 1 | 2 | 3` (Ort: `src/engine/solver.ts` oder neues `src/engine/tension.ts` — Entscheidung liegt beim Implementierer, an bestehende Modulgrenzen anlehnen). Schwellen: `> 20` → 0 (neutral), `<= 20` → 1, `<= 10` → 2, `<= 5` → 3. Nur wenn `remaining.exact === true` (oder analoges Discriminator-Feld, siehe aktuelle Form von `RemainingEstimate` in `solver.ts` prüfen); sonst immer `0`.

### Chrome-Eskalation (Hintergrund + Board-Glow)

- `GameBackground` (`src/components/ui/GameBackground.tsx`) bekommt eine neue optionale Prop `tensionLevel?: 0 | 1 | 2 | 3`. Bei Level > 0 verschiebt sich der Gradient in Richtung wärmerer/intensiverer Stops (z. B. Beimischung von `Game.accent`/`Game.star`-Tönen, stärker je höher das Level) — animiert per Reanimated (`withTiming` auf interpolierte Farbwerte oder Cross-Fade zwischen zwei `LinearGradient`-Layern mit `Animated.View`-Opacity). Rückschritt (Spieler bewegt sich vom Ziel weg, z. B. durch Undo/Fehlzug) animiert genauso sanft zurück auf ein niedrigeres Level.
- Board bekommt einen Glow-Rand (z. B. `boxShadow`/`shadowRadius` auf dem Board-Container in `PuzzleBoard.tsx` oder ein zusätzliches umgebendes `Animated.View`), dessen Intensität/Pulsgeschwindigkeit mit `tensionLevel` steigt. Level 3 pulsiert spürbar schneller/heller als Level 1.
- Farbgebung bleibt innerhalb der bestehenden Palette (`Game.accent`, `Game.accentDeep`, `Game.star`) — kein neuer Farbwert, der nicht aus `theme.ts` ableitbar ist.
- Welt-Gradient (`worldId`-spezifisch) bleibt die Basis; Tension-Effekt überlagert/verschiebt ihn, ersetzt ihn nicht.

### Tile-Slide-Animation

- `PuzzleTile.tsx`: `animX`/`animY` (aktuell tote SharedValues, siehe `PuzzleBoard.tsx:222-226`) werden tatsächlich genutzt. Beim Wechsel von `positionIndex` (Move) animiert die Kachel von der alten zur neuen `baseX/baseY`-Position statt sofort zu snappen.
- Dauer/Config aus der bereits vorhandenen, aber ungenutzten `TileAnimation.slideDurationMs` (`src/constants/theme.ts:104-108`, aktuell `120`ms) — ggf. leichtes Overshoot via `withSpring` statt `withTiming`, falls das besser zum "WOW"-Ziel passt (Implementierer-Entscheidung, an bestehenden Wert `120` als Referenzgröße halten).
- Multi-Tile-Züge (falls `multiSlideEnabled`, siehe `settingsStore.ts`) müssen alle betroffenen Kacheln konsistent animieren — prüfen, wie Mehrfachzüge aktuell durch `usePuzzle`/`PuzzleBoard` repräsentiert werden, bevor die Animation verdrahtet wird.

### Blank-Cell-Glow

- Die leere Zelle (`tileId === 0`, aktuell `return null` in `PuzzleTile.tsx:54`) bekommt eine eigene sichtbare Darstellung: ein sanft pulsierender Glow in `Game.accentSoft`/`Game.accent`, `withRepeat` + `withTiming` (reverse), Loop-Dauer im Bereich von ~1.5–2s.

### Hint-Pulse

- Aktuell statische Border (`isHinted ? 2.5 : 0` Breite, `PuzzleTile.tsx:68-69`). Ersetzen/ergänzen durch einen pulsierenden Effekt über `TileAnimation.hintPulseDurationMs` (bereits definiert, `400`ms) — z. B. Border-Opacity oder Glow-Radius oszillierend.

### Win-Moment (Ausbaustufe)

- `ConfettiEmitter.tsx`: Physik aufwerten — Rotation der Partikel während des Falls, Ease-Kurve für Gravity-Gefühl statt linearer `withTiming`. Bestehende `reduceMotion`-Gate bleibt.
- Kurzer Screen-Flash/Glow-Puls in `Game.accent` beim Auslösen von `isWon` (vor dem 1200ms-Delay zu `CompletionModal`, `[id].tsx:106-112`), synchron mit dem bestehenden `Haptics.notificationAsync(Success)` in `CompletionModal`.
- Kein neues Partikel-Framework (kein Skia/Lottie) — bleibt bei Reanimated + View-basierten Partikeln wie bisher.

### Settings-Integration

- Neuer Key `visualEffectsEnabled: boolean` in `Settings`-Type + `DEFAULTS` (`src/store/settingsStore.ts`), Default `true`.
- Neue `SwitchRow` im Settings-Screen (`src/app/settings/index.tsx`), gruppiert sinnvoll (z. B. nahe `hapticsEnabled`).
- Alle neuen Effekte (Tile-Slide, Blank-Glow, Hint-Pulse, Tension-Chrome, aufgewertete Win-Animation) sind an `visualEffectsEnabled && !reduceMotion` gekoppelt. Bei `false`/`reduceMotion`: Kacheln snappen wie bisher, kein Glow, kein Tension-Chrome (Hintergrund bleibt auf der neutralen Welt-Baseline), Confetti bleibt auf aktuellem (einfachem) Verhalten oder ganz aus — konsistent mit bestehendem `reduceMotion`-Verhalten für Confetti.

## Non-Goals

- Kein Sound-Design (kein `expo-av`/`expo-audio`, bleibt außerhalb dieses Specs).
- Kein neues Partikel-/Rendering-Framework (Skia, Lottie, Moti) — ausschließlich Reanimated + bestehende Primitives.
- Keine Änderung der Spiellogik/Solver-Ergebnisse — `tensionLevelFor` liest nur, verändert `remainingMoves` nicht.
- Keine Kombo/Streak-Mechanik (war Teil der ursprünglichen Ideenliste, hier bewusst nicht aufgenommen).
- Keine feingranularen Einzel-Toggles pro Effekt — ein Sammel-Schalter `visualEffectsEnabled` für den gesamten Effekt-Satz dieses Specs.
- Kein rückwirkendes Redesign von `CompletionModal`s Layout/Inhalt — nur der Übergang/Trigger davor wird verstärkt.

## Constraints

- Nur `react-native-reanimated` (v4, bereits vorhanden) — keine neue Animation-Dependency.
- Farben ausschließlich aus `Game`-Objekt (`theme.ts`) ableiten, keine neuen Hex-Werte hart kodieren.
- `PuzzleTile`/`PuzzleBoard` bleiben < ~150 Zeilen (Projekt-Konvention) — bei Überschreitung Subkomponenten auslagern (z. B. `BlankGlow.tsx`, `TensionGlow.tsx`).
- Kein `any`, explizite Return-Types auf allen exportierten Funktionen/Komponenten.
- Performance: Tension-Chrome und Blank-Glow laufen als Loop während des gesamten Spiels — müssen auf UI-Thread laufen (Reanimated Worklets), kein JS-Thread-Overhead pro Frame.
- Bestehende Tests (`tests/components/ui/GameBackground.test.tsx`, ggf. `tests/components/puzzle/*`) dürfen nicht brechen; neue Props sind optional mit sinnvollem Default, damit bestehende Aufrufe ohne `tensionLevel`/o.ä. weiterhin funktionieren.

## Task Breakdown

1. `tensionLevelFor`-Helper + Unit-Tests (reines Function-Mapping, kein UI).
2. Tile-Slide-Animation in `PuzzleTile.tsx`/`PuzzleBoard.tsx` verdrahten (inkl. Multi-Slide-Fall prüfen).
3. Blank-Cell-Glow als neue Subkomponente.
4. Hint-Pulse (Ersatz/Ergänzung der statischen Border).
5. `GameBackground`: `tensionLevel`-Prop + animierte Gradient-Verschiebung.
6. Board-Glow-Rand mit `tensionLevel`-Kopplung (in `PuzzleBoard.tsx` oder neuer Wrapper).
7. `[id].tsx`: `tensionLevelFor(remaining)` berechnen, an `GameBackground` und Board durchreichen.
8. Settings: `visualEffectsEnabled` in Store + Settings-UI.
9. Alle neuen Effekt-Stellen an `settings.visualEffectsEnabled && !reduceMotion` koppeln.
10. Win-Moment-Ausbaustufe: Confetti-Physik, Screen-Flash.
11. Tests je Phase (siehe Verification).

## Verification

- `tests/engine/tension.test.ts` (o. ä.): `tensionLevelFor` deckt alle Schwellen + den `hidesEstimate`/Lower-Bound-Fall (muss `0` liefern) ab.
- `tests/components/puzzle/PuzzleTile.test.tsx`, `tests/components/puzzle/PuzzleBoard.test.tsx`: rendern weiterhin korrekt mit/ohne `visualEffectsEnabled`.
- `tests/components/ui/GameBackground.test.tsx`: erweitert um `tensionLevel`-Prop-Fälle.
- `tests/store/settingsStore.test.ts`: `visualEffectsEnabled` Default + Persistenz.
- `just check` vor jedem Commit (siehe Workflow-Regel).
- Manuell im Simulator: Level mit exaktem `remaining` spielen, Schwellen bei 20/10/5 visuell prüfen; Level mit `≥N`-Schätzung spielen, Chrome bleibt neutral; `visualEffectsEnabled` ausschalten, Spiel verhält sich wie vor diesem Feature; `reduceMotion` (iOS Accessibility) aktivieren, gleiches Ergebnis.
