# Settings: Versionsanzeige + Debug-Unlock per Long-Press

## Outcome

Im Settings-Dialog wird oben rechts (im Header, symmetrisch zum "Fertig"-Button links) die App-Version inkl. Build-Nummer angezeigt. Ein 5-Sekunden-Long-Press auf diesen Text schaltet alle Welten frei (Debug-/Cheat-Zugriff), ohne den bestehenden Sterne-Fortschritt zu verändern.

## Scope

- `src/app/settings/index.tsx`: Header-Layout erweitern. Der bisherige leere `placeholder`-View (rechts, Breite 48, zum Zentrieren des Titels) wird durch einen `Pressable` mit Versions-Text ersetzt.
- Anzeigeformat: `"{version} ({build})"`, z. B. `"1.0.0 (1)"`.
  - `version` aus `Constants.expoConfig?.version`.
  - `build` aus `Constants.expoConfig?.ios?.buildNumber` (iOS) bzw. `Constants.expoConfig?.android?.versionCode` (Android), via `Platform.OS`.
- Long-Press-Dauer: 5000ms, via `Pressable`'s `onLongPress` + `delayLongPress={5000}`.
- Bei Auslösen: neue Store-Action `unlockAllWorlds()` in `src/store/progressStore.ts`, die `unlockedWorldIds` auf alle IDs aus `WORLDS` setzt (Set-Semantik, idempotent, verändert `records`/Sterne nicht).
- Kein sichtbares Feedback ist funktional gefordert außer dem tatsächlichen Freischalten; ein kurzes Toast/Alert ist optional und nicht Teil der Kern-Anforderung (siehe Non-Goals).

## Non-Goals

- Kein Debug-Menü, keine weiteren Cheat-Funktionen.
- Keine Persistenz eines "Unlock benutzt"-Flags oder Analytics-Events.
- Keine Änderung an der Stern-basierten Freischaltlogik selbst (`worldsUnlockedBy` bleibt unangetastet, wird nur nicht mehr die einzige Quelle für `unlockedWorldIds`).
- Keine visuelle Bestätigung (Snackbar/Alert) ist zwingend — kann in der Umsetzung ergänzt werden, wenn trivial, ist aber keine Abnahmekriterium.

## Constraints

- `expo-constants` ist bereits als Dependency vorhanden (`package.json`), aber bisher ungenutzt in `src/` — neue Nutzung, keine neue Dependency.
- Header-Layout darf die bestehende Zentrierung des Titels ("Einstellungen") nicht brechen — der rechte Slot muss weiterhin ca. so breit sein wie der linke "Fertig"-Button, damit der Titel visuell mittig bleibt. Text ist klein (Caption-Style), Pressable-Hit-Area darf aber per `hitSlop` großzügiger sein als der sichtbare Text.
- Kein `any`, explizite Return-Types, Styles über `StyleSheet.create`, folgt bestehendem Muster in `settings/index.tsx`.

## Task Breakdown

1. `progressStore.ts`: `unlockAllWorlds()` Action hinzufügen + Typ-Erweiterung `ProgressActions`.
2. `settings/index.tsx`: Header-Layout anpassen — rechter Slot wird `Pressable` mit Versions-`Text`, `onLongPress` ruft `unlockAllWorlds()`.
3. Tests:
   - `tests/store/progressStore.test.ts`: Test für `unlockAllWorlds()` (alle World-IDs enthalten, Records unverändert, idempotent bei erneutem Aufruf).
   - `tests/app/settings.test.tsx` (neu, folgt Muster aus `tests/app/worlds.test.tsx`): Versions-Text wird gerendert; `fireEvent(pressable, 'longPress')` löst `unlockAllWorlds` im gemockten Store aus.

## Verification

- `npm test -- tests/store/progressStore.test.ts tests/app/settings.test.tsx`
- `just check` (lint + typecheck + vollständige Testsuite) vor Commit.
- Manuell (falls Simulator verfügbar): Settings öffnen, Version oben rechts sichtbar, 5s gedrückt halten, Welten-Screen zeigt alle Welten entsperrt.
