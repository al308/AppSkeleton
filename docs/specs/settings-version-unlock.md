# Settings: Versionsanzeige + Debug-Unlock per Long-Press

## Outcome

Im Settings-Dialog wird oben rechts (im Header, symmetrisch zum "Fertig"-Button links) die App-Version inkl. Build-Nummer angezeigt. Ein 5-Sekunden-Long-Press auf diesen Text schaltet **alle Welten und alle Level darin** frei (Debug-/Cheat-Zugriff), ohne den bestehenden Sterne-Fortschritt zu verändern.

## Ergänzung (Nachtrag)

Die erste Umsetzung schaltete nur `unlockedWorldIds` frei (`unlockAllWorlds()`). Level-Sperren _innerhalb_ einer Welt sind aber eine eigene Bedingung: `src/app/world/[id].tsx:26-31` prüft pro Level `records[prevLevel.id] !== undefined` (Index-basierte Sequenz — Level N ist spielbar, sobald Level N-1 einen Abschlussrekord hat). Es existiert bereits ein statischer Compile-Time-Flag `DEV_UNLOCK_ALL` (`src/constants/devFlags.ts`, aktuell `false`), der genau diese Prüfung sowie die Welt-Prüfung in `src/app/worlds.tsx:23` umgeht — er ist aber ein Build-Flag, kein Runtime-Toggle, und daher für den Long-Press ungeeignet.

Lösung: ein neues **persistiertes Runtime-Flag** `devUnlockAll: boolean` im `progressStore`. Der Long-Press setzt dieses Flag statt (nur) `unlockedWorldIds` zu befüllen. `worlds.tsx` und `world/[id].tsx` prüfen zusätzlich zu `DEV_UNLOCK_ALL` (Compile-Time) diesen Store-Wert (Runtime) — beide Bedingungen bleiben ODER-verknüpft. Records/Sterne werden nicht synthetisch erzeugt; Level gelten nur fürs Anzeigen/Antippen als entsperrt.

## Scope

- `src/app/settings/index.tsx`: Header-Layout erweitern. Der bisherige leere `placeholder`-View (rechts, Breite 48, zum Zentrieren des Titels) wird durch einen `Pressable` mit Versions-Text ersetzt.
- Anzeigeformat: `"{version} ({build})"`, z. B. `"1.0.0 (1)"`.
  - `version` aus `Constants.expoConfig?.version`.
  - `build` aus `Constants.expoConfig?.ios?.buildNumber` (iOS) bzw. `Constants.expoConfig?.android?.versionCode` (Android), via `Platform.OS`.
- Long-Press-Dauer: 5000ms, via `Pressable`'s `onLongPress` + `delayLongPress={5000}`.
- Bei Auslösen: Store-Action `unlockAllWorlds()` in `src/store/progressStore.ts` setzt sowohl `unlockedWorldIds` (alle IDs aus `WORLDS`) als auch `devUnlockAll: true` (Set-Semantik, idempotent, verändert `records`/Sterne nicht).
- `src/app/worlds.tsx:23`: `isUnlocked` prüft zusätzlich `devUnlockAll` aus dem Store.
- `src/app/world/[id].tsx:26-31`: `isUnlocked` prüft zusätzlich `devUnlockAll` aus dem Store.
- Kein sichtbares Feedback ist funktional gefordert außer dem tatsächlichen Freischalten; ein kurzes Toast/Alert ist optional und nicht Teil der Kern-Anforderung (siehe Non-Goals).

## Non-Goals

- Kein Debug-Menü, keine weiteren Cheat-Funktionen.
- Keine Persistenz eines "Unlock benutzt"-Flags oder Analytics-Events (außer dem `devUnlockAll`-Boolean selbst, der Teil des normalen Progress-Persistenzobjekts ist).
- Keine Änderung an der Stern-basierten Freischaltlogik selbst (`worldsUnlockedBy` bleibt unangetastet, wird nur nicht mehr die einzige Quelle für `unlockedWorldIds`).
- Keine synthetischen `PuzzleRecord`-Einträge — Sterne-Anzeige/Statistiken bleiben unverändert, nur die Spielbarkeit wird freigeschaltet.
- Keine visuelle Bestätigung (Snackbar/Alert) ist zwingend — kann in der Umsetzung ergänzt werden, wenn trivial, ist aber keine Abnahmekriterium.

## Constraints

- `expo-constants` ist bereits als Dependency vorhanden (`package.json`), aber bisher ungenutzt in `src/` — neue Nutzung, keine neue Dependency.
- Header-Layout darf die bestehende Zentrierung des Titels ("Einstellungen") nicht brechen — der rechte Slot muss weiterhin ca. so breit sein wie der linke "Fertig"-Button, damit der Titel visuell mittig bleibt. Text ist klein (Caption-Style), Pressable-Hit-Area darf aber per `hitSlop` großzügiger sein als der sichtbare Text.
- Kein `any`, explizite Return-Types, Styles über `StyleSheet.create`, folgt bestehendem Muster in `settings/index.tsx`.

## Task Breakdown

1. `progressStore.ts`: `devUnlockAll: boolean` zu `ProgressState` hinzufügen (initial `false`, persistiert); `unlockAllWorlds()` erweitern, um zusätzlich `devUnlockAll: true` zu setzen.
2. `worlds.tsx`: `isUnlocked` um `|| devUnlockAll` ergänzen.
3. `world/[id].tsx`: `isUnlocked` um `|| devUnlockAll` ergänzen (zusätzlich zu bestehendem `DEV_UNLOCK_ALL`).
4. `settings/index.tsx`: Header-Layout anpassen — rechter Slot wird `Pressable` mit Versions-`Text`, `onLongPress` ruft `unlockAllWorlds()`. (Bereits umgesetzt in vorherigem Commit, unverändert.)
5. Tests:
   - `tests/store/progressStore.test.ts`: Test erweitern — `unlockAllWorlds()` setzt auch `devUnlockAll` auf `true`.
   - `tests/app/worlds.test.tsx`: neuer Test — mit `devUnlockAll: true` im Store sind alle Welten-Karten als entsperrt/antippbar gerendert, auch ohne `unlockedWorldIds`.
   - Neuer Test für `world/[id].tsx` (kein bestehender Testfile) ODER minimal: Test in `tests/app/settings.test.tsx` erweitern, der nach Long-Press `useProgressStore.getState().devUnlockAll === true` prüft (Store-Ebene reicht, UI-Ebene der Level-Liste ist optional/nice-to-have, da kein bestehendes Testfile für `world/[id].tsx` existiert und ein neues Testsetup mehr Aufwand wäre als der Kern-Fix rechtfertigt).

## Verification

- `npm test -- tests/store/progressStore.test.ts tests/app/settings.test.tsx tests/app/worlds.test.tsx`
- `just check` (lint + typecheck + vollständige Testsuite) vor Commit.
- Manuell (falls Simulator verfügbar): Settings öffnen, Version oben rechts sichtbar, 5s gedrückt halten, Welten-Screen zeigt alle Welten entsperrt, in eine gesperrte Welt wechseln und prüfen dass auch alle Level dort antippbar sind.
