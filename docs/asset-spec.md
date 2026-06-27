# Shiffle — Asset-Spezifikation (Branding-Assets)

> Vollständige Spezifikation für **alle Branding-Assets** (Icons, Splash, Store-Grafiken).
> Folgt der gemeinsamen [Design Language](design-language.md). Die Level-**Bilder**
> (Natur-Welt) sind separat in [asset-prompts.md](asset-prompts.md) gepflegt.
>
> **Warum diese Datei:** Die aktuellen App-Assets sind byte-identisch zum AppSkeleton-
> Platzhalter (md5 verifiziert) — Shiffle trägt noch das generische Skeleton-Logo. Diese
> Spec liefert alles, um konsistente, finale Assets zu generieren. Binär-Assets werden
> **nicht** vom Agent erzeugt (Design-Hoheit) — diese Spec ist die Vorlage dafür.

---

## 1. Shiffles Markenidentität (aus dem Code)

Quelle: [src/constants/theme.ts](../src/constants/theme.ts) `Game`-Palette — das ist der
echte In-Game-Look, **nicht** das frühere „indigo and teal".

| Rolle                | Hex                               | Verwendung im Asset                    |
| -------------------- | --------------------------------- | -------------------------------------- |
| Background deep      | `#0c0a24`                         | Vollflächiger Icon-/Splash-Hintergrund |
| Gradient             | `#1a1740` → `#0c0a24` → `#070613` | Splash-Verlauf (top→bottom)            |
| **Signature-Akzent** | `#a78bfa` (lavendel)              | Puzzle-Grid-Motiv, Buchstaben          |
| Akzent tief          | `#7c5cff`                         | Tiefen / Kanten des Motivs             |
| Star-Gold            | `#ffd166`                         | optionales Glanz-Detail (sparsam)      |
| Text hell            | `#f4f2ff`                         | „Shiffle"-Schriftzug im Splash         |

**Motiv:** ein **Schiebepuzzle-Raster mit einer Lücke** (eine Kachel verschoben, ein dunkles
Feld frei) — das Kern-Objekt der App. Abstrakt, geometrisch, lavendel auf tief-violett.

---

## 2. App-Assets — vollständige Liste

| #   | Datei                              | Pixel     |  Alpha   |     Status     |
| --- | ---------------------------------- | --------- | :------: | :------------: |
| 1   | `assets/icon.png`                  | 1024×1024 |   nein   | 🔴 Platzhalter |
| 2   | `assets/adaptive-icon.png`         | 1024×1024 |  **ja**  | 🔴 Platzhalter |
| 3   | `assets/splash.png`                | 2048×2048 | optional | 🔴 Platzhalter |
| 4   | `assets/favicon.png`               | 64×64     |    ja    | 🔴 Platzhalter |
| 5   | `store-assets/app-icon-1024.png`   | 1024×1024 | **nein** |    🔴 fehlt    |
| 6   | `store-assets/app-icon-512.png`    | 512×512   |   nein   |    🔴 fehlt    |
| 7   | `store-assets/feature-graphic.png` | 1024×500  |   nein   |    🔴 fehlt    |
| 8   | Screenshots (siehe §5)             | —         |   nein   |    🔴 fehlt    |

---

## 3. Generierungs-Prompts (pro Asset)

### 1 · App Icon — `assets/icon.png` (1024×1024, kein Alpha)

```
App icon, square 1:1, no text. A 4x4 sliding-tile puzzle grid seen flat from the front,
mid-solve: one tile is slid aside leaving a single dark empty square gap. The assembled
tiles form a bold concentric-square geometric pattern. Color scheme: lavender-violet tiles
(#a78bfa) with deeper violet edges (#7c5cff) on a deep dark indigo background (#0c0a24),
which fills the whole frame edge to edge. Clean flat vector art, strong silhouette, subtle
soft glow on the accent. --ar 1:1 --style raw
```

### 2 · Adaptive Icon Foreground — `assets/adaptive-icon.png` (1024×1024, **transparent**)

```
Same lavender-violet sliding-puzzle grid motif as the app icon, but on a fully transparent
background. The grid is centered and noticeably smaller, occupying only the central ~66%
of the frame (Android adaptive-icon safe zone) with generous transparent padding on all
sides. No background fill, no text. Flat vector. --ar 1:1
```

> app.json: `android.adaptiveIcon.backgroundColor` = **`#0c0a24`** (aktuell `#0f0f0f` →
> **muss korrigiert werden**, siehe §4).

### 3 · Splash — `assets/splash.png` (2048×2048)

```
App splash screen, square. The word "Shiffle" rendered as a row of sliding puzzle tiles,
one bold geometric sans-serif letter per tile, with one tile slid aside leaving a dark gap.
Lavender-violet tiles (#a78bfa) and off-white letters (#f4f2ff) on a deep vertical gradient
background from #1a1740 at the top to #070613 at the bottom. Minimal, clean, centered,
generous empty margin. No tagline. --ar 1:1
```

> app.json: `splash.backgroundColor` = **`#0c0a24`** (aktuell `#0f0f0f` → korrigieren).

### 4 · Favicon — `assets/favicon.png` (64×64, transparent)

Verkleinerte, vereinfachte Version des App-Icon-Motivs: nur **eine** Kachel + Lücke (das
4×4-Raster ist bei 64 px nicht lesbar). Lavendel auf transparentem Grund.

### 5 · iOS Marketing-Icon — `store-assets/app-icon-1024.png` (1024×1024, **kein Alpha**)

Identisch zu Asset 1 (icon.png), aber garantiert **ohne** Alpha-Kanal (App Store lehnt
Transparenz ab). Falls aus icon.png abgeleitet: Alpha über opaken `#0c0a24` flatten:

```bash
sips -s format png --deleteColorManagementProperties assets/icon.png --out store-assets/app-icon-1024.png
# danach prüfen, dass kein Alpha mehr da ist (flach gegen #0c0a24 rendern, falls doch)
```

### 6 · Play Icon — `store-assets/app-icon-512.png` (512×512, kein Alpha)

Aus Asset 5 herunterskaliert: `sips -Z 512 store-assets/app-icon-1024.png --out store-assets/app-icon-512.png`

### 7 · Feature Graphic — `store-assets/feature-graphic.png` (1024×500, kein Alpha)

```
Google Play feature graphic, 1024x500 wide banner. On the left, the lavender-violet sliding
puzzle grid motif (one tile slid aside, dark gap). On the right, the word "Shiffle" in bold
geometric off-white type with a short subtitle "Slide. Solve. Relax." Deep violet gradient
background (#1a1740 to #070613). Clean, lots of negative space, no device frames.
```

---

## 4. app.json — nötige Korrekturen (Konsistenz-Bug)

Aktuell stehen Splash- und adaptive-Background auf `#0f0f0f` (generisches Dark aus dem
Skeleton). Das passt **nicht** zur Game-Palette und bricht den Familien-Look. Beim
Einpflegen der neuen Assets mit ändern:

```jsonc
"splash":        { "image": "./assets/splash.png",        "backgroundColor": "#0c0a24" },
"android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png",
                               "backgroundColor": "#0c0a24" } }
```

> Dies ist eine `app.json`-Änderung — gehört in einen normalen Commit, **nicht** unter die
> „don't touch"-Binärassets.

---

## 5. Screenshots

| Set           | Pixel     | Anzahl | Inhalt                                                                      |
| ------------- | --------- | :----: | --------------------------------------------------------------------------- |
| iPhone 6.9"   | 1320×2868 |  4–6   | Home (World-Map) · Natur-Level mid-solve · Muster-Level · Completion+Sterne |
| iPad 13"      | 2064×2752 |  3–5   | gleiche Screens, Landscape ok                                               |
| Android Phone | 1080×1920 |  4–6   | dito                                                                        |

Regeln: alle drei Welten zeigen (Natur-Bild, Muster-SVG, Glyphen), Sterne-/Completion-Moment
einbauen, alle **flach (kein Alpha)**, benannt `01_…`, `02_…` in Reihenfolge, abgelegt in
`fastlane/screenshots/en-US/`.

Aufnahme: am echten Gerät/Sim in voller Auflösung, dann exakt skalieren:

```bash
sips -Z 2868 raw.png --out 01_home.png
sips -s format png --deleteColorManagementProperties in.png --out flat.png   # Alpha strippen
```

---

## 6. Konsistenz-Checkliste (vor dem Commit)

- [ ] Icon-Motiv = Schiebepuzzle-Grid mit Lücke, lavendel `#a78bfa` auf `#0c0a24`
- [ ] icon.png & app-icon-1024.png **ohne** Alpha
- [ ] adaptive-icon.png Foreground freigestellt, Safe-Zone (~66 %) eingehalten
- [ ] `splash.backgroundColor` **und** `adaptiveIcon.backgroundColor` = `#0c0a24`
- [ ] favicon erkennbar bei 64 px (vereinfachtes Motiv)
- [ ] feature-graphic 1024×500, kein Device-Frame
- [ ] Star-Gold (falls genutzt) exakt `#ffd166` (Familien-Token)
- [ ] Look reiht sich neben HarborChaos/StellarBlox als **Familie** ein (gleiches Dark-
      Gerüst, eigener Lavendel-Akzent) — Vergleich gegen [design-language.md](design-language.md)
