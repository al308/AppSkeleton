# Design Language — App-Familie (Shiffle, MagicGridBox, Frostpass, HarborChaos, StellarBlox)

> Diese Datei liegt in Shiffle, beschreibt aber die **gemeinsame visuelle Sprache aller
> Puzzle/Strategie-Apps** dieser Sammlung. Ziel: Die Apps sollen im Store nebeneinander
> als **eine Familie** erkennbar sein, ohne austauschbar zu wirken. Jede App teilt das
> Grundgerüst und variiert nur den **Signature-Akzent**.
>
> (Lesen & Schreiben ist eine Kinder-Lern-App mit eigener, hellerer Sprache und folgt
> diesem Familien-Look bewusst **nicht**.)

---

## 1. Das gemeinsame Gerüst ("was alle teilen")

Aus den im Code gelebten Paletten abgeleitet (`src/constants/colors.ts` etc.):

| Token                                 | Regel                                                                                                              | Belege                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Deep-Dark-Background**              | Sehr dunkler, leicht entsättigter Blau/Violett-Ton im Bereich `#0a0a–#0f1f`. Niemals reines Schwarz, niemals Weiß. | Shiffle `#0c0a24` · HarborChaos `#0d1b2a` · StellarBlox `#0B0E1A` · MGB `#0b1026` · Frostpass `#0a1628` |
| **Atmosphärischer Vertikal-Gradient** | Game-Screens nutzen einen dunklen Top→Bottom-Verlauf, damit es nach _Spiel_ statt _Tool_ aussieht.                 | Shiffle `bgGradient`                                                                                    |
| **Star-Gold** `#ffd166`               | Einheitliches Belohnungs-/Sterne-Gold über alle Apps. **Nicht** pro App ändern.                                    | Shiffle, HarborChaos, MGB identisch                                                                     |
| **Reject-Pink** `#ff7c9c`             | Fehlerhafte Aktion / „geht nicht".                                                                                 | Shiffle, MGB identisch                                                                                  |
| **Heller Text**                       | Off-white mit minimalem Stich der Akzentfarbe (`#f0–f4` …ff). Sekundärtext gedimmt über Alpha.                     | alle                                                                                                    |
| **Glassy Surfaces**                   | UI-Flächen sind halbtransparentes Weiß (`rgba(255,255,255,0.05–0.12)`) über dem Dark-Background.                   | Shiffle `surface`                                                                                       |

**Geometrie/Form:** klare, geometrische Vektorformen; abgerundete Ecken (`Radii.lg = 16`);
kräftige Silhouetten; **kein** Skeuomorphismus, **kein** Foto-Realismus in der UI/Icons.

---

## 2. Signature-Akzent pro App ("was jede App unterscheidet")

Jede App bekommt **genau einen** dominanten Akzent-Farbton. Der Akzent trägt Icon, Splash
und CTA. Das ist der einzige große Freiheitsgrad — alles andere bleibt im Gerüst.

| App              | Signature-Akzent                 | Hex                   | Charakter                      |
| ---------------- | -------------------------------- | --------------------- | ------------------------------ |
| **Shiffle**      | Violett / Indigo                 | `#a78bfa` → `#7c5cff` | ruhig, abstrakt, „mind-puzzle" |
| **MagicGridBox** | Sky-Blue                         | `#7cc4ff`             | klar, meditativ                |
| **Frostpass**    | Eis-Gold + Feuer-Rot (2 Spieler) | `#c8a84b` / `#c0392b` | Wikinger, Duell                |
| **HarborChaos**  | Teal + Warn-Rot                  | `#2a9d8f` / `#e63946` | maritim, verkehrsbunt          |
| **StellarBlox**  | Nebula-Purple + Cyan-CTA         | `#8B5CF6` / `#22D3EE` | kosmisch, Block-Blast          |

> Hinweis: Shiffle und StellarBlox liegen beide im Violett-Bereich. Zur Abgrenzung nutzt
> Shiffle **warm-violett (lavendel)** und eine _Puzzle-Grid_-Silhouette, StellarBlox
> **kühl-purple mit Cyan-CTA** und eine _Block/Stern_-Silhouette.

---

## 3. Icon-Konventionen (für alle Apps gleich)

- **Form:** ein einziges, sofort erkennbares Spiel-Motiv (das Kern-Objekt der App), zentral,
  starke Silhouette, lesbar bei 48 px.
- **Hintergrund im Icon:** der Deep-Dark-Background der App (vollflächig, **kein Alpha** bei
  iOS-Marketing-Icon), Motiv im Signature-Akzent.
- **Kein Text** im Icon (auch nicht der App-Name).
- **Adaptive-Icon (Android):** Motiv im Foreground mit großzügiger Safe-Zone, Hintergrund
  als separate `backgroundColor` = Deep-Dark der App.
- **Splash:** App-Name als/auf dem Spiel-Motiv, gleicher Dark-Background, gleicher Akzent.
- **app.json-Regel:** `splash.backgroundColor` **und** `adaptiveIcon.backgroundColor`
  müssen **exakt** dem Deep-Dark der App entsprechen (nicht `#0f0f0f` o. ä. Standard).

---

## 4. Verbindlicher Asset-Satz pro App

Jede App liefert genau diese Dateien. Detail-Specs (Pixelmaße, Prompts) pro App in deren
`docs/asset-spec.md`.

| Datei                              | Größe                               | Alpha?                           | Zweck                            |
| ---------------------------------- | ----------------------------------- | -------------------------------- | -------------------------------- |
| `assets/icon.png`                  | 1024×1024                           | nein                             | iOS/Basis-App-Icon               |
| `assets/adaptive-icon.png`         | 1024×1024                           | **ja** (Foreground freigestellt) | Android Foreground               |
| `assets/splash.png`                | 2048×2048 (oder 1284×2778 portrait) | optional                         | Launch                           |
| `assets/favicon.png`               | 48×48 / 64×64                       | ja                               | Web                              |
| `store-assets/app-icon-1024.png`   | 1024×1024                           | **nein**                         | iOS Marketing-Icon               |
| `store-assets/app-icon-512.png`    | 512×512                             | nein                             | Play-Icon                        |
| `store-assets/feature-graphic.png` | 1024×500                            | nein                             | Play Feature-Graphic             |
| Screenshots iOS 6.9"               | 1320×2868                           | nein                             | App Store                        |
| Screenshots iPad 13"               | 2064×2752                           | nein                             | App Store (falls supportsTablet) |
| Screenshots Android Phone          | z. B. 1080×1920                     | nein                             | Play                             |

**Quelle der Wahrheit:** HarborChaos und StellarBlox haben diesen Satz bereits vollständig
und korrekt (per md5 als „custom" verifiziert) — sie sind die **Referenz-Implementierung**
für die noch offenen Apps (Shiffle, Frostpass komplett; MGB adaptive-icon + favicon).
