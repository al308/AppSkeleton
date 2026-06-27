# TODO — Shiffle

> **🔄 Diese Datei ist die Single Source of Truth für den Dev-Status.** Sie speist die
> öffentliche Status-Seite **`shiffle.tenfives.com/devstatus.html`**. Nach jeder Änderung
> hier (Status-Emoji ✅🟡🔴⚪🚫 in der Tabelle) die Seite neu generieren:
> `cd HomeServerConfig/nginx/landingpage && node tools/gen-devstatus.mjs`.
> Die HTML niemals von Hand editieren. Details: `HomeServerConfig/nginx/landingpage/tools/README.md`.

Lebende, sehr detaillierte Aufgabenliste bis „komplett fertig". Diese Datei ist die
operative Checkliste; das große Bild steht in [PLAN.md](PLAN.md), die Mechanik in
[concept.md](concept.md), die Specs unter [docs/specs/](docs/specs/).

> Stand der Erhebung: 2026-06-26. Status-Spalte ist gegen den echten Code/Repo
> verifiziert, **nicht** aus PLAN.md übernommen (das PLAN.md behauptet z. B. „Icons
> vorhanden" — tatsächlich ist es noch der AppSkeleton-Platzhalter, siehe Phase 4).

---

## Phasen-Modell

Dieses Modell ist projektübergreifend gedacht (Shiffle, MagicGridBox, Frostpass,
HarborChaos, StellarBlox, LesenUndSchreiben) und für alle Apps gleich kalibriert, damit
sich der Reifegrad vergleichen lässt.

|  Phase | Name                           | Bedeutung — „done" heißt …                                                                                                                                                                                |
| -----: | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  **0** | Skeleton                       | Projekt klont sauber, Identifier gesetzt, Quality-Pipeline grün (`just check`), App bootet leer auf dem Simulator.                                                                                        |
|  **1** | First playable                 | Kern-Engine + ein Level end-to-end spielbar. „Hässlich, aber spielbar."                                                                                                                                   |
|  **2** | Content & feature-complete     | Alle MVP-Features + voller Content-Umfang vorhanden und verdrahtet. Funktional vollständig.                                                                                                               |
|  **3** | Polish & UX                    | Animationen, Haptics, Feedback, Empty-/Edge-States, A11y, Sound-Entscheidung. Fühlt sich „fertig" an.                                                                                                     |
|  **4** | Assets & Branding              | Echte Icons (alle Typen), Splash, Store-Grafiken, Screenshots, Marketing-Site. Kein Platzhalter mehr.                                                                                                     |
|  **5** | Store commit                   | EAS-Build + Submit, Store-Listings ausgefüllt, Privacy/Terms live, Tax/Compliance-Forms, eingereicht zur Review.                                                                                          |
|  **6** | Beta / Closed Test             | Build durch Store-Review, TestFlight + Google Closed Test (12×14 Tage) laufen, an echten Geräten getestet, crash-frei. Erstes „echte Hände dran".                                                         |
|  **7** | Public Launch                  | In beiden Stores **öffentlich live**, Listing final geschaltet, Launch-Hygiene (Versionsstand, Store-Status, Announce) erledigt.                                                                          |
|  **8** | Feedback-Loop & Observability  | Die eigentliche Schleife: Crash-/Error-Monitoring, Analytics und Store-Reviews laufen, werden **regelmäßig** gesichtet, triagiert und in einen Backlog überführt. Datengetriebene Entscheidungen möglich. |
|  **9** | Iteration / erstes Update      | Aus dem Feedback gebautes **v1.0.1** durch die komplette Build→Submit→Rollout-Pipeline ausgeliefert; die Update-Pipeline ist damit einmal end-to-end bewiesen.                                            |
| **10** | Komplett fertig / Dauerbetrieb | Alle Prozesse (Closed Test, Monitoring, Update-Pipeline, Backups, Tax/Compliance) bewährt **und dokumentiert**; App stabil im Dauerbetrieb; Reife-Backlog gepflegt, keine offenen Release-Blocker.        |

Die Phasen 6–9 bilden bewusst den Lebenszyklus **nach** dem Einreichen ab — Beta-Welle,
Launch, Feedback-Schleifen und erste Iteration —, weil genau dort die meiste „weiche"
Arbeit liegt, die in reinen Build-Plänen verloren geht.

Jede Phase hat 4–6 **Kategorien**:
`Features & Functions` · `UI/UX Improvements` · `Assets` · `Testing` · `Code Maturity` ·
`Release & Compliance`.

**Status-Werte:** ✅ done · 🟡 teilweise / in Arbeit · 🔴 offen · ⚪ optional/nice-to-have ·
🚫 bewusst gestrichen (v1).

---

## Phase 0 — Skeleton ✅ (abgeschlossen)

| Phase | Kategorie            | Todo                                                                          | Status | Kommentar                                 |
| ----: | -------------------- | ----------------------------------------------------------------------------- | :----: | ----------------------------------------- |
|     0 | Code Maturity        | Repo aus AppSkeleton geklont, Git-History sauber                              |   ✅   |                                           |
|     0 | Code Maturity        | Identifier gesetzt: `com.shiffle.app` (iOS+Android), slug, name               |   ✅   | app.json                                  |
|     0 | Code Maturity        | ESLint 9 flat config grün (`--max-warnings=0`)                                |   ✅   |                                           |
|     0 | Code Maturity        | TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |   ✅   | tsconfig                                  |
|     0 | Code Maturity        | Prettier formatiert, `just check`-Master-Gate grün                            |   ✅   |                                           |
|     0 | Testing              | Jest (`jest-expo`) läuft, erster Test grün                                    |   ✅   | tests/App.test.tsx                        |
|     0 | Code Maturity        | `.claude/` Rules/Agents/Skills/Hooks + justfile vorhanden                     |   ✅   |                                           |
|     0 | Release & Compliance | Skeleton-Boilerplate aus README/CHANGELOG entfernt                            |   🟡   | README-Regen-Falle prüfen (siehe lessons) |
|     0 | Code Maturity        | Reanimated/Gesture-Handler Babel-Setup + `index.ts`-Import                    |   ✅   |                                           |

---

## Phase 1 — First playable ✅ (abgeschlossen)

| Phase | Kategorie            | Todo                                            | Status | Kommentar             |
| ----: | -------------------- | ----------------------------------------------- | :----: | --------------------- |
|     1 | Features & Functions | Engine `puzzle.ts` (Brett-State, isSolved)      |   ✅   |                       |
|     1 | Features & Functions | Engine `shuffle.ts` (seeded, mulberry32)        |   ✅   | deterministisch       |
|     1 | Features & Functions | Engine `solvability.ts` (isSolvable-Guard)      |   ✅   |                       |
|     1 | Features & Functions | Engine `solver.ts` (IDA\*)                      |   ✅   | gehärtet gg. unlösbar |
|     1 | Features & Functions | `tileLayout.ts` (Bild-Offset-Mapping)           |   ✅   |                       |
|     1 | Features & Functions | `gameStore` lädt ein Level, hält State, Reset   |   ✅   |                       |
|     1 | UI/UX Improvements   | `PuzzleBoard` + `PuzzleTile` rendern ein Level  |   ✅   |                       |
|     1 | Features & Functions | Tap-to-move ein Level vollständig durchspielbar |   ✅   |                       |
|     1 | Testing              | Engine-Tests: puzzle/shuffle/solvability/solver |   ✅   | tests/engine/         |

---

## Phase 2 — Content & feature-complete ✅ (im Wesentlichen abgeschlossen)

| Phase | Kategorie            | Todo                                                                                                      | Status | Kommentar                                                                                              |
| ----: | -------------------- | --------------------------------------------------------------------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------ |
|     2 | Features & Functions | Grid-Größen 3×3, 4×4, 5×5                                                                                 |   ✅   |                                                                                                        |
|     2 | Features & Functions | Swipe/Pan-Steuerung zusätzlich zu Tap                                                                     |   ✅   | Control-Mode-Setting                                                                                   |
|     2 | Features & Functions | Multi-Slide (ganze Reihe schieben)                                                                        |   ✅   | Setting                                                                                                |
|     2 | Features & Functions | Welt „Natur" (9 Bild-Level)                                                                               |   ✅   | 3 AI-Bilder (lion/swans/kitten) × 3 Grid-Größen                                                        |
|     2 | Features & Functions | Welt „Muster" (15 Pattern/SVG)                                                                            |   ✅   |                                                                                                        |
|     2 | Features & Functions | Welt „Glyphen" (12 Pattern/SVG)                                                                           |   ✅   |                                                                                                        |
|     2 | Features & Functions | Hints (1-Step + 3-Step) via Solver                                                                        |   ✅   | useHints                                                                                               |
|     2 | Features & Functions | Reference-Modi off / pip / side / ghost                                                                   |   ✅   | SolutionReference                                                                                      |
|     2 | Features & Functions | Timer (start/pause/resume)                                                                                |   ✅   | useTimer                                                                                               |
|     2 | Features & Functions | Move-Counter                                                                                              |   ✅   |                                                                                                        |
|     2 | Features & Functions | „Bis Ziel"-HUD (remaining optimal moves, live)                                                            |   ✅   |                                                                                                        |
|     2 | Features & Functions | Sterne-System (computeStars)                                                                              |   ✅   |                                                                                                        |
|     2 | Features & Functions | Unlock-Chain / Level-Gating pro Welt                                                                      |   ✅   | progressStore — `worldsUnlockedBy` jetzt **scharf** verdrahtet (war tot, nur DEV_UNLOCK_ALL); getestet |
|     2 | Release & Compliance | **DEV_UNLOCK_ALL = false** (Release-Gate)                                                                 |   ✅   | umgelegt; Welten schalten per Sterne-Schwelle frei                                                     |
|     2 | Features & Functions | Resume (Spielstand persistiert über App-Neustart)                                                         |   ✅   | zustand persist                                                                                        |
|     2 | Features & Functions | Personal Best je Level                                                                                    |   ✅   | progressStore                                                                                          |
|     2 | Features & Functions | Pause-Funktion                                                                                            |   ✅   |                                                                                                        |
|     2 | Features & Functions | Training-Modus (trainingPlan + useTrainingSession)                                                        |   ✅   | Coach/MoveArrow/Ghost                                                                                  |
|     2 | Features & Functions | Settings: Haptics, Multi-Slide, Control-Mode, Reference-Default, Timer/Moves/Optimal, Tile-Numbers, Theme |   ✅   | settingsStore                                                                                          |
|     2 | Features & Functions | Nummern-genauer Solved-State (Pattern + Nummern sichtbar)                                                 |   ✅   | Phase A der numbered-solving Spec                                                                      |
|     2 | Features & Functions | `optimalMoves` für Fixed-Seed-Level backen                                                                |   ✅   | **36/36** Level — verifiziert (tests/data/optimalMoves.test.ts grün)                                   |
|     2 | Features & Functions | `optimalMovesPattern` (Farbgruppen) für Pattern-Level                                                     |   ✅   | **27/27** Pattern-Level — verifiziert, je ≤ numerisch                                                  |
|     2 | Features & Functions | `approx: true` / `~N` für unlösbar-teure 5×5                                                              |   ⚪   | nicht nötig: alle 5×5 haben echten gebackenen Wert                                                     |
|     2 | Features & Functions | Orientierung Portrait + Landscape                                                                         |   ✅   | useOrientation                                                                                         |
|     2 | Features & Functions | Offline (keine Netzwerk-Abhängigkeit)                                                                     |   ✅   | by design                                                                                              |
|     2 | Code Maturity        | Theme/Settings: „dead theme setting" aufgeräumt                                                           |   🟡   | siehe Memory — Rest-Verdrahtung prüfen                                                                 |

---

## Phase 3 — Polish & UX 🟡

| Phase | Kategorie            | Todo                                                              | Status | Kommentar                                 |
| ----: | -------------------- | ----------------------------------------------------------------- | :----: | ----------------------------------------- |
|     3 | UI/UX Improvements   | Confetti + CompletionModal beim Lösen                             |   ✅   | celebration/                              |
|     3 | UI/UX Improvements   | Haptics (place / reject / win)                                    |   ✅   | expo-haptics                              |
|     3 | UI/UX Improvements   | GameBackground + Game-Palette                                     |   ✅   |                                           |
|     3 | UI/UX Improvements   | Tile-Tap-/Slide-Animation glatt (Reanimated spring)               |   🟡   | auf Device-Feel verifizieren              |
|     3 | UI/UX Improvements   | Screen-Übergänge (Home→World→Game) animiert                       |   🔴   | gg. MGB/HarborChaos-Niveau angleichen     |
|     3 | UI/UX Improvements   | Empty-States (Welt ohne Fortschritt, alle Sterne)                 |   🔴   | prüfen ob vorhanden                       |
|     3 | UI/UX Improvements   | Star-Pop-Animation im CompletionModal                             |   🟡   | gegen MGB StarRating-Spring abgleichen    |
|     3 | UI/UX Improvements   | „Nächstes Level"-Flow direkt aus Completion                       |   🔴   | Komfort, prüfen                           |
|     3 | UI/UX Improvements   | Pause-Overlay visuell (nicht nur State)                           |   🟡   | verifizieren                              |
|     3 | UI/UX Improvements   | Tile-Numbers-Toggle visuell konsistent über alle Welten           |   🟡   |                                           |
|     3 | UI/UX Improvements   | Landscape-Layout wirklich getestet (kein Clipping)                |   🔴   | Device-Check                              |
|     3 | UI/UX Improvements   | Board skaliert responsiv über Screen-Größen (kleine/große Phones) |   🟡   | layout.ts — gg. echte Breiten prüfen      |
|     3 | UI/UX Improvements   | Safe-Area / Notch / Dynamic-Island respektiert                    |   🔴   | SafeAreaView durchgängig                  |
|     3 | UI/UX Improvements   | Tablet-Layout nutzt Fläche (nicht nur hochskaliertes Phone-UI)    |   🔴   | iPad — größere Boards/Ränder              |
|     3 | UI/UX Improvements   | Extreme Aspect-Ratios ok (z. B. 21:9, faltbare/kleine 16:9)       |   🔴   | kein Abschneiden des Bretts               |
|     3 | UI/UX Improvements   | Min-/Max-Tile-Size geklemmt (5×5 auf kleinem Phone noch tappbar)  |   🔴   | Touch-Target ≥ 44pt                       |
|     3 | Features & Functions | Sound/Audio-Entscheidung (stumm v1 vs. SFX)                       |   🚫   | concept.md: v1 stumm → bewusst gestrichen |
|     3 | UI/UX Improvements   | Accessibility-Labels auf interaktiven Tiles/Buttons               |   🔴   | getByRole-fähig machen                    |
|     3 | UI/UX Improvements   | Dynamic-Type / große Schrift bricht Layout nicht                  |   🔴   |                                           |
|     3 | UI/UX Improvements   | Reduce-Motion respektiert (Confetti/Animation aus)                |   ⚪   | a11y nice-to-have                         |
|     3 | UI/UX Improvements   | Dark/Light-Theme vollständig durchgezogen                         |   🟡   | useTheme — Rest-Screens prüfen            |
|     3 | Code Maturity        | Haptics hinter zentralem Modul (testbar)                          |   🟡   | gg. MGB `ui/haptics.ts`-Muster            |

---

## Phase 4 — Assets & Branding 🔴 (größte Lücke)

> **Stand 2026-06-26 (aktualisiert):** Alle App- und Store-Icons sind **neu generiert**
> aus dem Schiebepuzzle-Grid-Motiv (= World-Cover-Motiv) via `tools/gen-icons.mjs`
> (SVG → ImageMagick). Game-Palette `#0c0a24` / Lavendel `#a78bfa`, Alpha-Regeln pro
> Asset eingehalten. Kein Skeleton-Platzhalter mehr.
>
> **Spezifikation:** [docs/asset-spec.md](docs/asset-spec.md). Regenerieren jederzeit
> mit `node tools/gen-icons.mjs`.

### 4a — App-Icons (Runtime, im Build gebündelt)

| Phase | Kategorie     | Todo                                                                                              | Status | Kommentar                                                                         |
| ----: | ------------- | ------------------------------------------------------------------------------------------------- | :----: | --------------------------------------------------------------------------------- |
|     4 | Assets        | `assets/icon.png` — echtes iOS/Basis-Icon 1024×1024, **kein Alpha**                               |   ✅   | generiert, srgb 3.0 (kein Alpha), Puzzle-Grid-Motiv                               |
|     4 | Assets        | `assets/adaptive-icon.png` — Android Foreground (Safe-Zone beachten)                              |   ✅   | generiert, transparent, Motiv in zentralen ~66 %                                  |
|     4 | Code Maturity | **app.json: `splash.backgroundColor` + `adaptiveIcon.backgroundColor` von `#0f0f0f` → `#0c0a24`** |   ✅   | erledigt — beide Stellen auf Game-Palette, JSON validiert                         |
|     4 | Assets        | `assets/favicon.png` — Web-Favicon                                                                |   ✅   | generiert, 64×64 transparent (vereinfachtes Motiv)                                |
|     4 | Assets        | Monochrome/Themed-Icon (Android 13+)                                                              |   ⚪   | optional                                                                          |
|     4 | Assets        | Icon-Quelle/Prompt abgelegt                                                                       |   ✅   | [docs/asset-spec.md](docs/asset-spec.md) + `tools/gen-icons.mjs` (reproduzierbar) |
|     4 | Assets        | Icon final bestätigt (concept.md §23 offene Frage)                                                |   🟡   | generiert aus Welt-Motiv (User-Wunsch) — visuell bestätigt am Sim                 |

### 4b — Splash / Launch

| Phase | Kategorie | Todo                                           | Status | Kommentar                                       |
| ----: | --------- | ---------------------------------------------- | :----: | ----------------------------------------------- |
|     4 | Assets    | `assets/splash.png` — echtes Splash            |   ✅   | generiert, 2048×2048, Motiv + SHIFFLE-Wortmarke |
|     4 | Assets    | Splash-Background-Color passt zur Marke        |   ✅   | `#0c0a24` in app.json                           |
|     4 | Assets    | Splash sieht auf Notch + iPad + Tablet ok aus  |   🔴   | Device-Check                                    |
|     4 | Assets    | (Optional) separates vertikales Splash wie MGB |   ⚪   | MGB nutzt `splash-vertical.png`                 |

### 4c — Store-Grafiken (nur Listing, nicht im Build)

| Phase | Kategorie | Todo                                                           | Status | Kommentar                                       |
| ----: | --------- | -------------------------------------------------------------- | :----: | ----------------------------------------------- |
|     4 | Assets    | `store-assets/app-icon-1024.png` (iOS Marketing, kein Alpha)   |   ✅   | generiert, srgb 3.0                             |
|     4 | Assets    | Play-Icon 512×512 (aus selber Quelle)                          |   ✅   | `store-assets/app-icon-512.png`                 |
|     4 | Assets    | `store-assets/feature-graphic.png` 1024×500 (Play Pflicht)     |   ✅   | generiert, Gradient + Motiv + Wortmarke         |
|     4 | Assets    | iPhone 6.9" Screenshots 1320×2868 (Pflicht)                    |   🔴   | `fastlane/screenshots/en-US/` leer (nur README) |
|     4 | Assets    | iPad 13" Screenshots 2064×2752 (falls supportsTablet)          |   🔴   |                                                 |
|     4 | Assets    | Android Phone Screenshots (z. B. 1080×1920)                    |   🔴   |                                                 |
|     4 | Assets    | Alle Screenshots flach (kein Alpha) + korrekt benannt `01_…`   |   🔴   |                                                 |
|     4 | Assets    | Screenshots zeigen echte, repräsentative Level (alle 3 Welten) |   🔴   |                                                 |
|     4 | Assets    | (Optional) Screenshot-Framing/Captions                         |   ⚪   |                                                 |

### 4c-snd — Sound / Audio-Assets

> concept.md: **v1 ist bewusst stumm** (kein expo-audio in v1). Diese Zeilen halten das
> explizit fest (🚫 = bewusst gestrichen, nicht vergessen) und sammeln die SFX/Music-Items
> für eine spätere v1.1 (gehört dann inhaltlich zu Phase 9).

| Phase | Kategorie            | Todo                                                    | Status | Kommentar                                                     |
| ----: | -------------------- | ------------------------------------------------------- | :----: | ------------------------------------------------------------- |
|     4 | Assets               | Entscheidung dokumentiert: v1 stumm                     |   🚫   | concept.md — bewusst, Haptics ersetzen SFX                    |
|     4 | Assets               | SFX „Tile-Slide"                                        |   🚫   | v1.1-Kandidat                                                 |
|     4 | Assets               | SFX „Tile-Snap/Block" (Kollision)                       |   🚫   | v1.1                                                          |
|     4 | Assets               | SFX „Level Complete" / Win-Jingle                       |   🚫   | v1.1                                                          |
|     4 | Assets               | SFX „Stern vergeben" / Reward                           |   🚫   | v1.1                                                          |
|     4 | Assets               | SFX „Hint" / Button-Tap (UI)                            |   🚫   | v1.1                                                          |
|     4 | Assets               | Hintergrund-Musik-Loop (dezent, abschaltbar)            |   🚫   | v1.1                                                          |
|     4 | Assets               | Audio-Format/-Komprimierung festgelegt (m4a/ogg, Größe) |   ⚪   | erst bei v1.1 relevant                                        |
|     4 | Features & Functions | Settings-Toggle „Sound an/aus" + „Musik an/aus"         |   ⚪   | v1.1 — Settings hat schon Haptics-Toggle als Vorbild          |
|     4 | Features & Functions | Audio-Modul am Boundary (MixWithOthers, testbar)        |   ⚪   | v1.1 — LUS-Lesson: expo-av + MixWithOthers gg. Ducking-Latenz |

### 4d — Marketing-Website

| Phase | Kategorie | Todo                                                 | Status | Kommentar                          |
| ----: | --------- | ---------------------------------------------------- | :----: | ---------------------------------- |
|     4 | Assets    | `web/index.html` Landing auf Shiffle-Marke gebrandet |   🟡   | existiert — Inhalt/Branding prüfen |
|     4 | Assets    | OG-Image / Logo für Web                              |   🔴   |                                    |
|     4 | Assets    | Website deployed + erreichbar (GitHub Pages o. ä.)   |   🔴   |                                    |

---

## Phase 5 — Store commit 🔴 (noch nicht begonnen)

> `eas.json` ist jetzt **angelegt** (aus Template, `appVersionSource: local`).
> Es gab noch keinen EAS-Build/Submit (braucht Account-Login). Fastlane-Gerüst
> (`fastlane/`, metadata/, scripts/) ist vorhanden.

| Phase | Kategorie            | Todo                                                      | Status | Kommentar                                                            |
| ----: | -------------------- | --------------------------------------------------------- | :----: | -------------------------------------------------------------------- |
|     5 | Release & Compliance | `eas.json` aus Template anlegen (dev/preview/production)  |   ✅   | angelegt, JSON validiert, preview baut iOS-Sim                       |
|     5 | Release & Compliance | EAS-Projekt verknüpft (owner, projectId in app.json)      |   🔴   | braucht `eas init` mit deinem Account-Login (kann ich nicht autonom) |
|     5 | Release & Compliance | Version/buildNumber/versionCode gesetzt (1.0.0 / 1 / 1)   |   ✅   | app.json: version 1.0.0, ios.buildNumber "1", android.versionCode 1  |
|     5 | Release & Compliance | iOS Bundle-ID ↔ ASC SKU getrennt halten (lesson)          |   🟡   | siehe lessons learned                                                |
|     5 | Release & Compliance | Apple Developer App in ASC angelegt (Apple-ID)            |   🔴   |                                                                      |
|     5 | Release & Compliance | `ios.ascAppId` für non-interactive submit gesetzt         |   🔴   | StellarBlox-Falle                                                    |
|     5 | Release & Compliance | Google Play App angelegt (Console)                        |   🔴   |                                                                      |
|     5 | Release & Compliance | `play-service-account.json` hinterlegt                    |   🔴   |                                                                      |
|     5 | Release & Compliance | `app-store-metadata.md` final ausgefüllt                  |   ✅   | echte Werte: Shiffle, 36 Levels/3 Welten, Beschreibung, Review-Notes |
|     5 | Release & Compliance | `play-store-metadata.md` final ausgefüllt                 |   ✅   | echte Werte + Data-Safety „keine Daten" + Closed-Test-Text           |
|     5 | Release & Compliance | Keine Emojis in Store-Texten (lesson)                     |   ✅   | Store-Texte emoji-frei (nur `•` Bullets)                             |
|     5 | Release & Compliance | Privacy-Policy live + URL in Listing                      |   🟡   | `web/legal/privacy-policy.html` vorhanden, deploy prüfen             |
|     5 | Release & Compliance | Terms live + URL                                          |   🟡   | `web/legal/terms-of-service.html`                                    |
|     5 | Release & Compliance | iOS Privacy-Manifest: „keine Daten erhoben" (concept §15) |   🔴   |                                                                      |
|     5 | Release & Compliance | Android Data-Safety-Form ausgefüllt                       |   🔴   |                                                                      |
|     5 | Release & Compliance | Content-Rating-Fragebogen (beide Stores)                  |   🔴   |                                                                      |
|     5 | Release & Compliance | `prettier-ignore` für fastlane/ (README-Regen-Falle)      |   🟡   | siehe lessons                                                        |
|     5 | Release & Compliance | Erster EAS-Build iOS erfolgreich                          |   🔴   |                                                                      |
|     5 | Release & Compliance | Erster EAS-Build Android (.aab) erfolgreich               |   🔴   |                                                                      |
|     5 | Release & Compliance | `eas submit` iOS → TestFlight/Review eingereicht          |   🔴   |                                                                      |
|     5 | Release & Compliance | `eas submit` Android → Internal/Closed Track              |   🔴   |                                                                      |
|     5 | Code Maturity        | `just check` unmittelbar vor Submit grün                  |   🟡   | aktuell 106 Tests grün                                               |

---

## Phase 6 — Beta / Closed Test 🔴

| Phase | Kategorie            | Todo                                                      | Status | Kommentar                                    |
| ----: | -------------------- | --------------------------------------------------------- | :----: | -------------------------------------------- |
|     6 | Release & Compliance | iOS-Build von App-Review akzeptiert (kein Reject)         |   🔴   |                                              |
|     6 | Release & Compliance | TestFlight-Build verteilt (interne Tester)                |   🔴   |                                              |
|     6 | Release & Compliance | TestFlight Beta-App-Review bestanden (externe Tester)     |   ⚪   | nur falls externe Gruppe                     |
|     6 | Release & Compliance | Google **Closed Test** Track angelegt + Build hochgeladen |   🔴   |                                              |
|     6 | Release & Compliance | **12 Tester eingeladen UND Einladung angenommen**         |   🔴   | Familie/Freunde reicht; aktive Annahme zählt |
|     6 | Release & Compliance | Closed-Test-Onboarding-Text an Tester verteilt            |   🟡   | Muster in play-store-metadata.md             |
|     6 | Release & Compliance | **14-Tage-Closed-Test-Frist** angestoßen (Uhr läuft)      |   🔴   | Pflicht-Wartezeit vor production             |
|     6 | Testing              | Cold-Start, Resume, Hintergrund/Vordergrund auf Gerät     |   🔴   | persist-State über App-Kill testen           |
|     6 | Testing              | Keine Crashes im Beta-Zeitraum (Logs gesichtet)           |   🔴   |                                              |

#### Geräteklassen-Matrix (echte Geräte / Sim, je: Layout · Touch · Haptics · Perf)

| Phase | Kategorie            | Todo                                                 | Status | Kommentar                                    |
| ----: | -------------------- | ---------------------------------------------------- | :----: | -------------------------------------------- |
|     6 | Testing              | iPhone **klein** (SE / mini, ~4.7–5.4")              |   🔴   | engster Fall — 5×5-Board + HUD ohne Clipping |
|     6 | Testing              | iPhone **Standard** (14/15/16, ~6.1")                |   🔴   | Referenz-Gerät                               |
|     6 | Testing              | iPhone **groß / Max** (Pro Max, ~6.9")               |   🔴   | Dynamic-Island + Screenshot-Quelle           |
|     6 | Testing              | iPad **Standard** (10.9")                            |   🔴   | Tablet-Layout, Portrait+Landscape            |
|     6 | Testing              | iPad **Pro 13"**                                     |   🔴   | größte Fläche; Screenshot-Quelle 2064×2752   |
|     6 | Testing              | Android **Low-End** (wenig RAM, alte CPU)            |   🔴   | Perf/Memory-Grenzfall, SVG-Render            |
|     6 | Testing              | Android **Standard-Phone** (Pixel-Klasse)            |   🔴   | adaptive-icon real prüfen                    |
|     6 | Testing              | Android **großes Phone / Foldable**                  |   🔴   | Aspect-Ratio + Fold-Resize                   |
|     6 | Testing              | Android **Tablet**                                   |   🔴   | falls Play-Tablet-Listing                    |
|     6 | Testing              | OS-Spannweite: ältestes unterstütztes iOS + Android  |   🔴   | min-SDK aus app.json                         |
|     6 | Testing              | Pro Klasse: Haptics fühlbar (nur echtes Gerät)       |   🔴   | place/reject/win                             |
|     6 | Testing              | Pro Klasse: Performance 60fps beim Slide (kein Jank) |   🔴   | Reanimated auf Low-End                       |
|     6 | Features & Functions | Beta-Blocker aus Tester-Reports gefixt               |   🔴   | Sammelposten                                 |
|     6 | UI/UX Improvements   | Offensichtliche UX-Stolperer aus Beta behoben        |   🔴   | Sammelposten                                 |

---

## Phase 7 — Public Launch 🔴

| Phase | Kategorie            | Todo                                                      | Status | Kommentar                    |
| ----: | -------------------- | --------------------------------------------------------- | :----: | ---------------------------- |
|     7 | Release & Compliance | iOS auf „Ready for Sale" / öffentlich freigegeben         |   🔴   |                              |
|     7 | Release & Compliance | Android Production-Track promoted + 100% Rollout          |   🔴   | nach bestandenem Closed Test |
|     7 | Release & Compliance | Phased-Release-Strategie entschieden (sofort vs. gestuft) |   🔴   |                              |
|     7 | Release & Compliance | Store-Listing final geschaltet (beide live identisch)     |   🔴   |                              |
|     7 | Release & Compliance | Versions-/Build-Tag im Git gesetzt (`v1.0.0`)             |   🔴   |                              |
|     7 | Release & Compliance | Marketing-Website live + Store-Links verlinkt             |   🔴   | aus Phase 4d                 |
|     7 | Release & Compliance | Store-URLs in README/CHANGELOG dokumentiert               |   🔴   |                              |
|     7 | Release & Compliance | Launch-Announce (wo auch immer) raus                      |   ⚪   | optional                     |

---

## Phase 8 — Feedback-Loop & Observability 🔴

| Phase | Kategorie            | Todo                                                               | Status | Kommentar                                         |
| ----: | -------------------- | ------------------------------------------------------------------ | :----: | ------------------------------------------------- |
|     8 | Code Maturity        | Crash-/Error-Monitoring entschieden + eingerichtet                 |   🔴   | Sentry o. ä. — oder bewusst „keins" dokumentieren |
|     8 | Code Maturity        | Crash-frei-Rate-Schwelle definiert (Trigger für Hotfix)            |   🔴   |                                                   |
|     8 | Features & Functions | Minimal-Analytics entschieden (privacy-konform / opt-out)          |   🔴   | concept sagt „keine Daten" → ggf. bewusst keins   |
|     8 | Release & Compliance | Analytics-Entscheidung mit Privacy-Manifest/Data-Safety konsistent |   🔴   | sonst Store-Widerspruch                           |
|     8 | Release & Compliance | Store-Reviews/Ratings beider Stores regelmäßig gesichtet           |   🔴   | Kadenz festlegen                                  |
|     8 | Release & Compliance | Antwort-Vorlage / Prozess für Store-Reviews                        |   ⚪   |                                                   |
|     8 | Code Maturity        | Feedback → Backlog-Prozess etabliert (wo landen Issues?)           |   🔴   | GitHub Issues o. ä.                               |
|     8 | Code Maturity        | Erste Feedback-Runde triagiert (Bug vs. Wunsch vs. Won't-fix)      |   🔴   |                                                   |
|     8 | Testing              | Reale Nutzungs-Pfade aus Feedback gegen Tests gespiegelt           |   🔴   | Lücken in Suite schließen                         |
|     8 | Code Maturity        | Support-Kontakt (E-Mail) im Store + erreichbar                     |   🔴   | Pflichtfeld Listing                               |

---

## Phase 9 — Iteration / erstes Update 🔴

| Phase | Kategorie            | Todo                                                 | Status | Kommentar                           |
| ----: | -------------------- | ---------------------------------------------------- | :----: | ----------------------------------- |
|     9 | Features & Functions | Top-Feedback-Items für v1.0.1 ausgewählt             |   🔴   | aus Phase 8 Backlog                 |
|     9 | Features & Functions | v1.0.1-Änderungen implementiert + getestet           |   🔴   |                                     |
|     9 | Code Maturity        | Version/buildNumber/versionCode korrekt erhöht       |   🔴   | iOS build++ & Android versionCode++ |
|     9 | Release & Compliance | CHANGELOG.md für v1.0.1 gepflegt                     |   🔴   |                                     |
|     9 | Release & Compliance | „What's New"-Text beide Stores                       |   🔴   |                                     |
|     9 | Release & Compliance | EAS-Build + Submit v1.0.1 (beide Plattformen)        |   🔴   | Pipeline-Wiederholung               |
|     9 | Release & Compliance | v1.0.1 durch Review + live ausgerollt                |   🔴   | beweist Update-Pipeline end-to-end  |
|     9 | Testing              | Regressions-Check: alte Spielstände migrieren sauber |   🔴   | persist-Migration                   |
|     9 | Code Maturity        | Update-Runbook aus echtem Durchlauf dokumentiert     |   🔴   | RELEASE.md o. ä.                    |

---

## Phase 10 — Komplett fertig / Dauerbetrieb 🔴

| Phase | Kategorie            | Todo                                                                      | Status | Kommentar                                                     |
| ----: | -------------------- | ------------------------------------------------------------------------- | :----: | ------------------------------------------------------------- |
|    10 | Release & Compliance | iOS App stabil **live** (≥1 Update-Zyklus überstanden)                    |   🔴   |                                                               |
|    10 | Release & Compliance | Android App stabil **live** (production, 100%)                            |   🔴   |                                                               |
|    10 | Release & Compliance | W-8BEN / Steuerformulare beide Stores abgeschlossen                       |   🔴   | einmalig, vor erster Auszahlung                               |
|    10 | Release & Compliance | Alle Compliance-Forms dauerhaft gültig (kein „action required")           |   🔴   |                                                               |
|    10 | Code Maturity        | Update-/Release-Pipeline dokumentiert + reproduzierbar                    |   🔴   | aus Phase 9 verfestigt                                        |
|    10 | Code Maturity        | Closed-Test-/Beta-Prozess dokumentiert (für nächste App wiederverwendbar) |   🔴   |                                                               |
|    10 | Code Maturity        | Monitoring läuft im Dauerbetrieb (Alerts erreichen dich)                  |   🔴   |                                                               |
|    10 | Code Maturity        | Coverage-Gate 80% in CI scharf geschaltet                                 |   🔴   | rules/20-testing                                              |
|    10 | Code Maturity        | CI (GitHub Actions) baut + testet grün auf main                           |   🟡   | `.github/workflows/ci.yml` vorhanden — grünen Lauf bestätigen |
|    10 | Code Maturity        | Backups / Keys (`.p8`, service-account, Signing) sicher abgelegt          |   ✅   | `AuthKey_*.p8` gitignored + nicht getrackt (verifiziert)      |
|    10 | Code Maturity        | Backup-Wiederherstellung einmal getestet (Key-Verlust-Szenario)           |   🔴   |                                                               |
|    10 | Testing              | Echtes Nutzer-Feedback über ≥1 Zyklus eingearbeitet                       |   🔴   |                                                               |
|    10 | Testing              | E2E-/Smoke-Test eines kompletten Level-Durchlaufs                         |   ⚪   | nice-to-have                                                  |
|    10 | Code Maturity        | Reife-Backlog gepflegt, keine offenen Release-Blocker                     |   🔴   | Definition-of-Done der App                                    |

---

## Sofort-Prioritäten (verdichtet)

> Phase 2 ist **vollständig** — die optimalMoves-Daten waren bereits komplett (39/39 +
> 27/27 Pattern, Test grün). Der frühere „2 fehlen"-Eintrag war ein grep-Zählartefakt
> (`id: string;` aus der Typdefinition mitgezählt). Damit ist die größte verbliebene
> Lücke rein bei Assets/Release.

1. **Phase 4a/4b:** echtes Icon-Set + Splash erstellen (icon, adaptive, favicon, splash).
   Größte sichtbare Lücke — App trägt aktuell das Skeleton-Logo.
2. **Phase 4c + 5:** Screenshots schießen, `eas.json` anlegen, erster Build.
