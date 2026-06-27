# Sliding Puzzle Game — Full Concept & Feature Specification

## 1. Overview

A polished, ad-free, fully offline sliding puzzle game for iOS and Android. No accounts, no tracking, no IAP. Pure puzzle satisfaction.

**App name:** `Shiffle`  
**Platform:** iOS + Android (Expo / React Native with EAS builds)  
**Target audience:** Casual to enthusiast puzzle players, ages 8+  
**Distribution:** App Store + Google Play, single free download (no paywalls)

---

## 2. Tech Stack

| Layer             | Library                                           |
| ----------------- | ------------------------------------------------- |
| Framework         | Expo SDK (latest) + expo-router                   |
| Animations        | react-native-reanimated 3                         |
| Gestures          | react-native-gesture-handler                      |
| State             | Zustand (with persist middleware)                 |
| Persistence       | AsyncStorage (all local data via zustand persist) |
| Haptics           | expo-haptics                                      |
| Pattern rendering | react-native-svg                                  |
| SVG flags         | react-native-svg (hand-defined) or flag asset set |
| Navigation        | expo-router (file-based)                          |
| Build             | EAS Build + EAS Submit                            |
| Sound (v2 only)   | expo-audio — not a v1 dependency                  |

> No image-slicing library needed: tiles render the bundled source image with a `translateX/Y` offset (see 13.3). Pattern levels render purely via `react-native-svg`.

---

## 3. Grid Sizes & Difficulty System

### 3.1 Standard Grid Sizes

| Level  | Grid | Tiles    | Mechanical Difficulty |
| ------ | ---- | -------- | --------------------- |
| Easy   | 3×3  | 8 tiles  | Beginner              |
| Medium | 4×4  | 15 tiles | Classic               |
| Hard   | 5×5  | 24 tiles | Challenging           |
| Expert | 6×6  | 35 tiles | Hard                  |
| Master | 7×7  | 48 tiles | Very Hard             |

For a first release: 3×3 through 5×5 is sufficient. 6×6 and 7×7 are stretch goals.

### 3.2 Visual Difficulty — Pattern Library

Beyond grid size, a second independent difficulty axis: **visual color count**. For a given geometric pattern, increasing the number of distinct colors means fewer identical tiles, fewer interchangeable positions, and therefore a harder puzzle — approaching photo-level uniqueness at 8+ colors.

#### Two axes of pattern difficulty

| Axis                | Range             | Effect                                                                         |
| ------------------- | ----------------- | ------------------------------------------------------------------------------ |
| **Geometric shape** | 15+ pattern types | Determines which tiles are structurally grouped                                |
| **Color count**     | 2 → 8+ colors     | Determines how many tiles share an appearance → how many valid solutions exist |

With **2 colors**: many tiles are visually identical → multiple valid solutions → much shorter path to any one → easy.  
With **8 colors on a 5×5**: most tiles unique → approaches a single valid solution → hard.

#### Pattern Shape Library

Each shape defines which grid positions belong to the same structural group. Color is then assigned per group.

| Shape ID         | Description                                        | Natural color steps  |
| ---------------- | -------------------------------------------------- | -------------------- |
| `stripes_h`      | Horizontal bands across the grid                   | 2 – gridSize         |
| `stripes_v`      | Vertical bands                                     | 2 – gridSize         |
| `stripes_d`      | Diagonal stripes (↘ direction)                     | 2 – (2×gridSize − 1) |
| `stripes_d2`     | Diagonal stripes (↙ direction)                     | 2 – (2×gridSize − 1) |
| `checker`        | Classic checkerboard alternation                   | 2, 4                 |
| `checker_large`  | 2×2 block checkerboard                             | 2, 4                 |
| `nested_squares` | Concentric square rings outward from center        | 2 – ⌊gridSize/2⌋ + 1 |
| `star`           | Central star shape vs background (+ optional ring) | 2 – 4                |
| `cross`          | Plus/cross shape vs 4 corner blocks                | 2, 3, 4              |
| `radial`         | Pie slices radiating from center                   | 2 – 8                |
| `diamond`        | Rotated square / diamond vs corners                | 2, 3, 4              |
| `frame`          | Outer border frame + optional inner frames         | 2 – ⌊gridSize/2⌋ + 1 |
| `zigzag`         | Horizontal zigzag rows                             | 2 – gridSize         |
| `waves`          | Smooth sinusoidal bands (approximated in steps)    | 2 – gridSize         |
| `spiral`         | Single clockwise spiral path outward               | 2 – 4                |
| `gradient_h`     | Left-to-right stepped color gradient               | 2 – gridSize         |
| `gradient_v`     | Top-to-bottom stepped color gradient               | 2 – gridSize         |
| `gradient_r`     | Radial stepped gradient from center                | 2 – ⌊gridSize/2⌋ + 1 |

#### Color count as difficulty modifier

For each pattern shape, the available color steps map to these canonical difficulty labels:

| Colors | Difficulty label | Typical tile group size (4×4 example) |
| ------ | ---------------- | ------------------------------------- |
| 2      | Sehr leicht      | 8 tiles per color                     |
| 3      | Leicht           | 5–6 tiles per color                   |
| 4      | Mittel           | 3–4 tiles per color                   |
| 5–6    | Schwer           | 2–3 tiles per color                   |
| 7–8    | Sehr schwer      | 1–2 tiles per color                   |

Difficulty label in UI: combine all three dimensions.

> Example: `4×4 · Streifen · 3 Farben` vs `5×5 · Stern · 6 Farben` vs `5×5 · KI-Bild`

#### Color palettes per pattern

Each pattern instance gets one of several curated palettes (not user-selectable, chosen by level config). Palettes are perceptually distinct per step to ensure tiles are clearly distinguishable:

- `warm` (reds, oranges, yellows)
- `cool` (blues, teals, purples)
- `earth` (browns, greens, ochres)
- `neon` (high-contrast vivid colors)
- `mono` (black → white gradient steps)
- `flag_de` / `flag_fr` / `flag_it` / `flag_jp` / ... (exact flag colors for named sets)

#### Solver behavior for pattern variants

When tiles share an appearance (`tileGroupId`), **any permutation of tiles within that group counts as solved**. The win-detection check and the hint solver must both receive the full `tileGroups` mapping.

```ts
type TileGroup = {
  groupId: string;
  tileIds: number[]; // all tile IDs that are visually identical
};

// Win check: for every position p, tiles[p].groupId === goal[p].groupId
```

Optimal move count for pattern puzzles: pre-compute against the nearest valid solution (not one specific target arrangement).

### 3.3 Shuffle Depth

A third axis: how many random moves from solved state the initial shuffle uses.

| UI Label       | Shuffle moves                          |
| -------------- | -------------------------------------- |
| Entspannt      | 20                                     |
| Normal         | 50–80                                  |
| Herausfordernd | 150+                                   |
| Zufällig       | Full random (filtered for solvability) |

Shuffle always guarantees a solvable state (see Section 5.2).

---

## 4. Level System & World Structure

### 4.1 World Map

Levels are grouped into themed **worlds**. Each world has:

- A visual theme (color palette, icon, background)
- 12–15 puzzles, difficulty ascending
- A star threshold to unlock the next world

**Starter worlds:**

| #   | World  | Theme (all AI-generated imagery)                                     |
| --- | ------ | -------------------------------------------------------------------- |
| 1   | Natur  | Landscapes, plants, skies                                            |
| 2   | Städte | Stylized architecture, skylines                                      |
| 3   | Muster | Geometric patterns, flags, gradients (SVG-rendered, no image assets) |
| 4   | Kunst  | AI illustrations, abstract art, pixel art                            |
| 5   | Tiere  | Stylized animal close-ups                                            |
| 6   | Welt   | Stylized maps, space, planets                                        |

More worlds can be added via content updates (just assets + level config).

### 4.2 Star Rating per Puzzle

Each completed puzzle earns 1–3 stars:

| Stars  | Condition                                |
| ------ | ---------------------------------------- |
| ⭐     | Puzzle completed (any)                   |
| ⭐⭐   | Completed within 2× optimal moves        |
| ⭐⭐⭐ | Completed at or under 1.3× optimal moves |

Optional: time-based bonus star (configurable per level).

### 4.3 Unlock Rules

- First puzzle of each world is always unlocked.
- Each subsequent puzzle unlocks after completing the previous one (any star count).
- Next world unlocks when current world has at least 60% of total possible stars.
- All previously completed puzzles remain replayable at any time.

### 4.4 Level Config Schema

```ts
type Level = {
  id: string;
  world: string;
  title: string;

  gridSize: 3 | 4 | 5 | 6 | 7;

  // A level is EITHER an image puzzle OR a pattern puzzle:
  source:
    | { kind: 'image'; asset: string } // path to bundled AI image
    | { kind: 'pattern'; pattern: PatternDefinition }; // SVG-generated (see 13.2)

  shuffleDepth: 'relaxed' | 'normal' | 'hard' | 'random';
  shuffleSeed?: number; // fixed seed → reproducible shuffle (for star fairness)

  optimalMoves?: number; // pre-computed; null/undefined for large grids → show "~"
  tileGroups?: TileGroup[]; // pattern puzzles: interchangeable tiles (auto-derived for patterns)

  timeLimitSeconds?: number; // optional; null = untimed
  hintsAllowed: number; // total hint tokens per puzzle (e.g. 3)
};
```

> **Note on `shuffleSeed`:** Each level ships with a fixed seed so the starting position is identical for every player. This makes the `optimalMoves` value exact and meaningful for star ratings. "Random from pool" mode (free play) uses a runtime seed instead.

---

## 5. Core Puzzle Engine

### 5.1 Data Model

```ts
type PuzzleState = {
  tiles: number[]; // flat array, index = position, value = tileId (0 = blank)
  size: number; // grid width = height
  blankIndex: number; // current index of blank tile (cached for perf)
};
```

### 5.2 Solvability Guarantee

Never show an unsolvable puzzle. Two approaches (use the simpler):

**Option A — Shuffle by valid moves:** Start from solved state, apply N random valid moves. Always solvable by construction. Preferred for controlled shuffle depth.

**Option B — Solvability check after random shuffle:**

- If `size` is odd: solvable iff number of inversions is even.
- If `size` is even: solvable iff `(inversions + blank_row_from_bottom)` is even.
- If unsolvable: swap any two non-blank tiles to flip parity.

Use **Option A** for shuffle-depth modes; **Option B** for fully random.

### 5.3 Move Validation

A tile can move if and only if it is directly adjacent (horizontally or vertically) to the blank tile.

For **multi-slide** (optional power feature): all tiles in the same row or column between the tapped tile and the blank slide in one gesture. This is toggled in settings.

### 5.4 Win Detection

**Standard:** `tiles` array equals `[1, 2, 3, ..., n*n-1, 0]`

**Pattern variant:** Win if for every position p, `tiles[p]` belongs to the same `tileGroup` as the target tile for position p. Precompute valid solution sets at level load time.

### 5.5 Optimal Move Count

- **3×3:** Compute with IDA\* on load (< 1ms). Store as `optimalMoves` in level config.
- **4×4:** Pre-compute offline and bake into level config. IDA\* in-session is feasible for most states but not guaranteed fast.
- **5×5+:** Pre-compute offline with a bounded solver or approximation. Mark as `~N` (approximate) in UI if not exact.
- **Dynamic puzzles (random/custom):** Run a time-limited BFS/A\* (max 200ms). If no result: show `—` for optimal count.

---

## 6. Controls

### 6.1 Tap

Tap any tile adjacent to the blank → it slides into the blank.

### 6.2 Swipe

Swipe a tile in the direction of the blank → it slides.  
Also: swipe the blank tile in any direction → adjacent tile moves into blank.

### 6.3 Multi-Slide (Optional, toggled in settings)

Tap or swipe any tile in the same row/column as the blank: all tiles between tapped tile and blank slide simultaneously.

### 6.4 Gesture Handling

Use `react-native-gesture-handler`:

- `TapGestureHandler` for taps on tiles.
- `PanGestureHandler` for swipes; determine direction on `onEnd` from `translationX/Y`.
- Minimum swipe distance threshold: 10px to prevent accidental triggers.
- No conflicting scroll containers — the board is the only interactive area.

### 6.5 Animations

All moves animated with `react-native-reanimated`:

- Tile slides in `120ms`, easing: `Easing.out(Easing.quad)`.
- Invalid move: small shake animation on tapped tile (`200ms`).
- Haptic feedback on every valid move (`Haptics.impactAsync('light')`).
- Stronger haptic on invalid move.

---

## 7. Hint System

### 7.1 Hint Types

| Type            | Description                                                                           |
| --------------- | ------------------------------------------------------------------------------------- |
| **1-Step Hint** | Highlights the single best next tile to move.                                         |
| **3-Step Hint** | Highlights tiles for the next 3 moves in sequence, one at a time.                     |
| **Full Path**   | (3×3 only) Optionally reveal the full solution path. Costs all remaining hint tokens. |

### 7.2 Hint Budget

Each puzzle has a fixed hint allowance (configured per level, e.g. 3 hints total). Hints are consumed per use:

- 1-step hint = costs 1 hint token.
- 3-step hint = costs 2 hint tokens.

Hint tokens reset when a puzzle is restarted. They do **not** carry over between puzzles.

### 7.3 Solver for Hints

Use **IDA\*** with Manhattan distance heuristic:

```ts
function manhattanHeuristic(state: PuzzleState, goalState: PuzzleState): number {
  // sum of Manhattan distances of each tile from its goal position
}

function idaStar(state: PuzzleState): Move[] | null {
  // returns optimal sequence of moves, or null if time-limit exceeded
}
```

Hint computation runs in a `setTimeout` or `InteractionManager.runAfterInteractions` to avoid blocking the UI.

Time limit per computation:

- 3×3: no limit (always fast).
- 4×4: 500ms limit, fall back to greedy if exceeded.
- 5×5+: 300ms limit, use greedy best-first (move tile with highest Manhattan distance improvement).

**Greedy fallback:** pick the move that most reduces total Manhattan distance. Not optimal, but always gives a sensible hint.

### 7.4 UI — Hint Feedback

- Highlighted tile: colored border pulse (`2px`, accent color, `400ms` breathing animation).
- If 3-step: show step counter badge on highlighted tile (`1/3`, `2/3`, `3/3`).
- Tap hint button again to advance to next step in sequence.
- Hint sequence cancels on any manual move.

---

## 8. Reference Image Modes

The player can view the completed puzzle image for orientation. Multiple display modes, toggled from in-game menu:

| Mode                                   | Description                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Aus**                                | No reference image shown.                                                                    |
| **PiP (Picture-in-Picture)**           | Small thumbnail in a corner. Draggable. Default mode.                                        |
| **Nebeneinander (Side by Side)**       | Puzzle on left, reference on right (landscape) or top/bottom (portrait). Resizable split.    |
| **Geist (Ghost Overlay)**              | Reference rendered at 20% opacity behind puzzle tiles. Helps orient without fully revealing. |
| **Halten zum Zeigen (Hold to Reveal)** | Hold a dedicated button to temporarily show the full image. Releases back to puzzle.         |
| **Einblenden (Fade Toggle)**           | Tap to cross-fade between puzzle and full reference image. Tap again to return.              |

Default mode: **PiP**. Mode is remembered per user, not per level.

The reference image is the un-cut source image. It must stay in sync with the current grid layout (same proportions).

---

## 9. Timer & Statistics

### 9.1 Timer

- Starts automatically when first move is made.
- Pauses when app goes to background (`AppState` listener).
- Resumes on foreground.
- Shows `MM:SS` format in HUD; for long sessions shows `HH:MM:SS`.
- Timer is visual info only — no time-based fail state (unless optional time challenge mode is added later).

### 9.2 Stats Displayed In-Game (HUD)

```
[🕐 02:14]   [↕ 47 Züge]   [Best: 31 ✦]   [Optimal: ~28]   [Hints: 2 left]
```

- **Timer**: current session time.
- **Züge (Moves)**: current move count.
- **Best**: personal best moves for this puzzle (persisted locally).
- **Optimal**: pre-computed optimal move count (or approximate).
- **Hints left**: remaining hint tokens.

HUD can be minimized to a compact strip to preserve board space on small screens.

### 9.3 Stats Stored per Puzzle (Local)

```ts
type PuzzleRecord = {
  levelId: string;
  completions: number;
  bestMoves: number;
  bestTime: number; // seconds
  stars: 1 | 2 | 3;
  lastPlayedAt: string; // ISO date
  hintsUsedTotal: number;
};
```

---

## 10. Celebration & Completion

### 10.1 Completion Trigger

Win detection runs after every move. On win: freeze board, trigger celebration sequence.

### 10.2 Animation Sequence

1. **Tile Snap (0–400ms):** All tiles briefly scale up 105% then snap back. Staggered per tile (10ms delay each).
2. **Confetti Burst (400–2000ms):** Particle system overlay. 60–100 particles, random colors from world palette. Uses reanimated worklets or a lightweight JS particle engine.
3. **Image Reveal (800ms):** Puzzle board cross-fades into full seamless image (no tile borders). Duration: 600ms ease-in-out.
4. **Score Card Slide-In (1200ms):** Modal slides up from bottom.

### 10.3 Score Card Content

```
╔═══════════════════════════════╗
║   🎉  Puzzle Gelöst!          ║
║                               ║
║   ⭐⭐⭐   Neue Bestleistung!  ║
║                               ║
║   Züge:  47  (Best: 47 🏆)   ║
║   Zeit:  2:14                 ║
║   Optimal: ~28                ║
║   Effizienz: 59%              ║
║                               ║
║  [Nochmal]  [Weiter ▶]       ║
╚═══════════════════════════════╝
```

- If personal best broken: extra golden glow + stronger haptic.
- If all 3 stars earned for first time: star burst animation per star.
- "Weiter" advances to next locked puzzle in the world.

### 10.4 Sound — Deferred to v2

v1 ships haptics-only. Sound implementation begins in v2 after first store release. No expo-av dependency needed in v1.

---

## 11. Screen & Navigation Architecture

```
/app
  index.tsx              → Home Screen (World Map)
  /world/[worldId].tsx   → Level Select within World
  /game/[levelId].tsx    → Active Puzzle Screen
  /settings/index.tsx    → Settings Screen
  /stats/index.tsx       → Global Stats Screen (optional v2)
```

### 11.1 Home Screen

- Horizontal scroll of world cards (or vertical list).
- Each card: world artwork, title, `X/Y ⭐` progress, lock state.
- Settings icon top-right; global stats icon top-left.
- No tutorial needed — first level of World 1 is a 3×3 and self-explanatory.

### 11.2 Level Select Screen

- Grid of puzzle thumbnails (3 per row on phone, 4+ on tablet).
- Each cell: thumbnail preview, star rating, lock overlay.
- Scroll within world.
- Back button → World Map.

### 11.3 Game Screen

- Full-screen puzzle board (centered, respects safe areas).
- HUD strip top or bottom (auto-layout based on orientation).
- Floating action buttons: Hint, Reference Mode toggle, Pause/Menu.
- Pause overlay: Resume, Restart, Settings, Exit to Menu.
- No distracting chrome — board is the focus.

### 11.5 First Run / Onboarding

No heavy tutorial. On very first launch:

- World 1 opens directly, first puzzle is a 3×3 with `relaxed` shuffle.
- A one-time subtle coachmark on the board: "Tippe oder wische eine Kachel neben dem leeren Feld."
- Coachmark dismisses on first valid move and never shows again (flag in settingsStore).
- No account prompt, no permissions request, no splash beyond the standard Expo splash.

### 11.6 Pause & Resume

- Pause overlay: Resume, Restart (resets shuffle to seed), Settings, Exit to Menu.
- Leaving the game screen mid-puzzle auto-saves `activeGame` state.
- On returning (from menu or after app kill), the level select shows a "Fortsetzen" badge on the in-progress puzzle.
- Starting a fresh puzzle while one is in progress prompts: "Aktuelles Puzzle verwerfen?" before overwriting.

### 11.4 Settings Screen

| Setting                | Options                          |
| ---------------------- | -------------------------------- |
| Haptics                | On / Off                         |
| Multi-slide            | On / Off                         |
| Control mode           | Tap / Swipe / Both               |
| Reference mode default | PiP / Side-by-side / Ghost / Off |
| Timer visible          | On / Off                         |
| Move counter visible   | On / Off                         |
| Optimal moves visible  | On / Off                         |
| Tile numbers           | On / Off                         |
| Theme                  | Light / Dark / Auto              |

---

## 12. Orientation & Responsive Layout

### 12.1 Supported Orientations

All four orientations supported. Layout adapts automatically.

| Orientation      | Layout behavior                                              |
| ---------------- | ------------------------------------------------------------ |
| Portrait Phone   | Board centered, HUD below. Reference PiP top-right.          |
| Landscape Phone  | Board left-aligned, HUD right panel strip.                   |
| Portrait Tablet  | Board centered with larger tiles, HUD below with more space. |
| Landscape Tablet | Board centered (larger), side panel for HUD + reference.     |

### 12.2 Board Sizing

Board size = `min(screenWidth, screenHeight) * 0.90`, with a max of `520px` (tablet cap).  
Tile size = `boardSize / gridSize` minus a small gap (`2px`).  
All values computed dynamically using `useWindowDimensions()`.

### 12.3 Safe Areas

Use `react-native-safe-area-context` throughout. No content behind notches or home indicators.

---

## 13. Image Asset System

### 13.1 Source Images — AI-Generated

> **Shipped state (v1):** the Natur world ships **3** AI-generated images
> (`lion`, `swans`, `kitten`), each reused across the 3×3 / 4×4 / 5×5 grid sizes
> for 9 levels. Earlier placeholder photos (Lorem Picsum / Unsplash) were removed
> for licensing reasons — see `docs/asset-prompts.md`. Future content should add
> more AI images per the pipeline below.

All photo-style level images are AI-generated (no stock photos, no licensing concerns). Generation pipeline (offline, pre-release):

1. Generate at `1024×1024` or `1024×1024` square via Midjourney / DALL-E / Stable Diffusion.
2. Manually curate for: clear focal point, good color contrast, works well sliced.
3. Store in `/assets/images/worlds/[world]/[levelId].jpg` (JPEG quality 90).
4. No runtime generation — images are bundled with the app.

**Style guide for AI image generation:**

- Avoid: real people's faces, copyrighted characters, brand logos, text in image.
- Prefer: strong geometric regions, clear color blocks, interesting compositions that "reveal" well when assembled.
- Aspect ratio: always 1:1 (square). Compose centrally.
- Minimum resolution: 1024×1024. Target: 1200×1200 for retina quality.

### 13.2 Pattern Image Generation

Pattern-type puzzles (any of the 17 shapes) are generated programmatically with `react-native-svg` — no static image assets. The `tileGroups` mapping is derived automatically from `shape + colorCount + gridSize`.

```ts
type PatternDefinition = {
  shape: PatternShape; // one of the 17 shapes in section 3.2
  colorCount: number; // 2–8; determines how many groups get distinct colors
  palette: PaletteId; // named palette (warm, cool, earth, neon, mono, flag_de, ...)
};

// Generated at runtime: no static image asset needed for pattern levels
// Pattern renders via react-native-svg based on tileGroups derived from shape + colorCount + gridSize
```

### 13.3 Tile Rendering

Each tile is a `View` containing an `Image` (or `Svg`) with:

- `overflow: 'hidden'`
- Absolute-positioned source image shifted by `(col * tileSize, row * tileSize)` to show the correct slice.
- This avoids pre-slicing; the source image is rendered once per tile with a `translateX/Y` offset.

### 13.4 Tile Borders & Number Labels

- Thin gap between tiles (2–3px, same color as board background).
- Optional: show tile numbers (1-indexed from top-left). Toggled in settings. Useful as training wheels.
- Tile corner radius: 4–6px.

---

## 14. Local Persistence

All data is stored locally. Zero network calls. Zero analytics.

### 14.1 Data Stored

All persistence goes through Zustand's `persist` middleware backed by AsyncStorage. Three persisted stores:

| Store         | Key                  | Content                                                |
| ------------- | -------------------- | ------------------------------------------------------ |
| settingsStore | `shiffle.settings`   | User preferences (haptics, control mode, theme, etc.)  |
| progressStore | `shiffle.progress`   | Map of `levelId → PuzzleRecord` + unlocked world IDs   |
| gameStore     | `shiffle.activeGame` | Current in-progress puzzle (for resume after app kill) |

> `gameStore` persistence enables **resume**: if the player leaves mid-puzzle (even after the app is killed), the exact tile state, move count, elapsed time, and hint tokens are restored on next launch.

### 14.2 No Cloud, No Accounts

- No sign-in.
- No iCloud/Google backup integration (for simplicity; can be added later via `expo-secure-store` migration).
- Uninstall = data lost (standard local app behavior; document in App Store description).

---

## 15. Privacy & Distribution

- Zero third-party SDKs that track users.
- No analytics, no crash reporting with PII (can use Sentry with full anonymization if desired).
- App Store privacy manifest: declare local storage only; no data collected.
- No ATT prompt needed (no ad tracking).
- GDPR compliance trivial (nothing leaves the device).

---

## 16. Accessibility

- All interactive elements have `accessibilityLabel` and `accessibilityHint`.
- Tile labels describe position: `"Tile 5, row 2 column 2"`.
- Reduced motion: check `AccessibilityInfo.isReduceMotionEnabled()` → disable confetti and tile animations if true.
- Font scaling: HUD text respects system font size.
- Color contrast: all text meets WCAG AA minimum.

---

## 17. Folder Structure

```
/src
  /app                    expo-router screens
    index.tsx             home / world map
    /world/[id].tsx       level select
    /game/[id].tsx        active puzzle
    /settings/index.tsx
  /components
    /puzzle
      PuzzleBoard.tsx     main board + gesture layer
      PuzzleTile.tsx      single tile with image slice
      HintHighlight.tsx   animated hint overlay
      ReferencePanel.tsx  all reference display modes
    /ui
      HUD.tsx             timer, moves, hints strip
      StarRating.tsx
      WorldCard.tsx
      LevelCard.tsx
    /celebration
      ConfettiEmitter.tsx
      CompletionModal.tsx
      TileSnapAnimation.tsx
  /engine
    puzzle.ts             state model, move validation, win detection
    shuffle.ts            seeded solvable shuffle (mulberry32 PRNG)
    solvability.ts        parity check
    solver.ts             IDA* + greedy fallback for hints
    patterns.ts           pattern → tileGroups derivation + SVG render data
    tileLayout.ts         tile slice offset calculation (translateX/Y)
  /hooks
    usePuzzle.ts          core game loop hook
    useTimer.ts
    useHints.ts
    useGestures.ts
    useOrientation.ts
  /store
    gameStore.ts          active puzzle state + resume (zustand persist)
    progressStore.ts      persisted level records + unlocks
    settingsStore.ts      user preferences
  /data
    levels.ts             all level configs (with precomputed optimalMoves)
    worlds.ts             world configs
  /assets
    /images/worlds/...    AI-generated source images (1024×1024+)
  /constants
    theme.ts              colors, spacing, radii
    layout.ts             board sizing formulas
/tools
  precompute_solver.py    offline optimal-move computation (not bundled)
```

---

## 18. App Configuration & Build

### 18.1 app.json / app.config.ts essentials

```jsonc
{
  "expo": {
    "name": "Shiffle",
    "slug": "shiffle",
    "orientation": "default", // all orientations; locked per-screen if needed
    "userInterfaceStyle": "automatic", // respects system light/dark
    "ios": {
      "bundleIdentifier": "com.<yourorg>.shiffle",
      "supportsTablet": true,
      "infoPlist": { "ITSAppUsesNonExemptEncryption": false },
    },
    "android": {
      "package": "com.<yourorg>.shiffle",
      "permissions": [], // explicitly empty — no permissions needed
    },
    "privacy": "public",
  },
}
```

### 18.2 Store Compliance Notes

- **iOS Privacy Manifest:** declare "Data Not Collected". No tracking domains.
- **Android Data Safety form:** "No data collected, no data shared."
- **Age rating:** 4+ / Everyone (no objectionable content; AI images curated accordingly).
- **No IAP, no ads:** no StoreKit / Billing library included.
- W-8BEN / tax forms in App Store Connect & Google Play Console required even for free apps (one-time setup).

### 18.3 Asset Pipeline Checklist

- App icon: 1024×1024 (generated separately, see Open Questions).
- Adaptive icon (Android): foreground + background layers.
- Splash screen: simple logo on solid/gradient background.
- Screenshots for store: at least one per device class (6.7" iPhone, 12.9" iPad, Android phone + tablet).

---

## 19. Offline Solver — Precompute Script

A standalone Python script (not shipped in the app) computes `optimalMoves` for every fixed-seed level and writes them back into `levels.ts`.

```
/tools/precompute_solver.py
```

Behavior:

- For each level: reconstruct the exact shuffled state from `gridSize + shuffleSeed`.
- 3×3, 4×4: IDA\* with Manhattan + linear-conflict heuristic → exact optimal.
- 5×5+: bounded IDA\* with a time cap; if cap exceeded, store best-found as `~N` and flag `approx: true`.
- Pattern puzzles: solve against the nearest valid goal arrangement (respecting `tileGroups`).
- Output: JSON merged into `levels.ts` so the app never solves at runtime for stars.

> The same shuffle RNG algorithm must be used in both the Python script and the TS app (document the exact PRNG, e.g. mulberry32, so seeds reproduce identically on both sides). This is the single most important correctness detail in the whole project.

---

## 20. Error & Empty States

The app is fully offline, so most error surfaces don't exist — but handle these:

- **Corrupt/missing saved state:** if `activeGame` fails to parse, discard silently and return to menu. Never crash on bad persisted data.
- **Image asset fails to load:** show a neutral placeholder tile color; the puzzle is still playable (tiles just lack imagery).
- **Solver returns nothing for a hint (time cap):** fall back to greedy; if greedy also fails, show "Kein Tipp verfügbar" and refund the hint token.
- **No empty list states** in v1 (worlds and levels are always present in bundle). Future custom-puzzle feature will need an empty state.

---

## 21. MVP Scope

### Must-Have (v1.0)

- [ ] 3×3, 4×4, 5×5 grid sizes
- [ ] 2 complete worlds (Natur AI-images + Muster patterns) × 12 levels each
- [ ] Pattern library: at least 6 shapes (stripes, checker, nested_squares, star, diamond, gradient) × 2–6 colors
- [ ] Tap + swipe controls
- [ ] Move counter + background timer
- [ ] Personal best tracking (moves + time)
- [ ] 1-step + 3-step hints (limited per puzzle)
- [ ] PiP reference image mode
- [ ] Completion animation (confetti + score card)
- [ ] Star rating system
- [ ] World unlock logic
- [ ] Resume in-progress puzzle after app kill
- [ ] Portrait + landscape, phone + tablet
- [ ] Dark/light theme
- [ ] Haptics (toggleable)
- [ ] Full local persistence
- [ ] Zero ads, zero tracking, fully offline

### v1.1

- [ ] 6×6 grid
- [ ] 2 more worlds
- [ ] Side-by-side + ghost reference modes
- [ ] Multi-slide toggle
- [ ] Tile number labels option
- [ ] Stats screen (total puzzles, total moves, total time)

### v2.0

- [ ] 7×7 grid
- [ ] Daily challenge puzzle (seeded random, same puzzle for all users — still local)
- [ ] Custom image from camera roll
- [ ] Timed challenge mode (stars based on time)
- [ ] More worlds: Kunst, Tiere, Welt

---

## 22. Resolved Decisions

| #   | Topic                         | Decision                                                                                                                                                             |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Optimal moves for 5×5+ levels | Pre-compute offline with Python A\* script → bake into `levels.ts`. Show `~N` for approximations. Levels can select "random from pool" because optimal is pre-known. |
| 2   | Flag/pattern system           | Full geometric pattern library (17 shapes × 2–8 colors), no separate flag handling — flags are just `stripes_v` / `stripes_h` with `flag_xx` palette.                |
| 3   | Image source                  | AI-generated images (Midjourney / DALL-E / SD). No stock photos. Bundle with app.                                                                                    |
| 4   | Sound assets                  | Deferred to v2. v1 ships with haptics only.                                                                                                                          |

| 5 | App name | **Shiffle** — trademark-cleared (no conflicting software/game mark found; only an unrelated low-profile gig-economy LinkedIn page). Recommend a quick EUIPO + USPTO check in Nice classes 9 & 41 before store submit. |

## 23. Open Questions (Still To Decide)

1. **Icon concept** — AI generation brief: partial 4×4 sliding puzzle mid-solve, one tile visibly displaced revealing a gap, bold geometric colors, clean dark or gradient background. No text in the icon itself.
2. **Minimum puzzle count for store launch** — Recommendation: 2 worlds × 12 levels = 24 puzzles. Enough variety, manageable asset pipeline.
3. **Org/bundle identifier** — Decide `com.<yourorg>.shiffle` for both stores before first EAS build.
