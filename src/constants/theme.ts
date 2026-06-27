export const Colors = {
  light: {
    background: '#f5f5f0',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    text: '#111111',
    textSecondary: '#666666',
    textMuted: '#999999',
    accent: '#5c6bc0',
    accentLight: '#e8eaf6',
    star: '#f9a825',
    starEmpty: '#e0e0e0',
    tile: '#ffffff',
    tileBackground: '#e0e0e0',
    tileBorder: '#d0d0d0',
    success: '#43a047',
    locked: '#bdbdbd',
    hintHighlight: '#ff7043',
    overlay: 'rgba(0,0,0,0.5)',
  },
  dark: {
    background: '#0f0f0f',
    surface: '#1e1e1e',
    surfaceElevated: '#2a2a2a',
    text: '#f0f0f0',
    textSecondary: '#aaaaaa',
    textMuted: '#666666',
    accent: '#7986cb',
    accentLight: '#1a1f4a',
    star: '#f9a825',
    starEmpty: '#3a3a3a',
    tile: '#2a2a2a',
    tileBackground: '#1a1a1a',
    tileBorder: '#333333',
    success: '#66bb6a',
    locked: '#444444',
    hintHighlight: '#ff7043',
    overlay: 'rgba(0,0,0,0.7)',
  },
} as const;

// Game-facing palette. Unlike `Colors` (which adapts to system light/dark for
// utility screens like Settings), the game itself is always presented on a
// deep, atmospheric backdrop so it reads as a *game* rather than a tool.
export const Game = {
  // Vertical gradient for every game-facing screen, top -> bottom.
  bgGradient: ['#1a1740', '#0c0a24', '#070613'] as const,
  bgSolid: '#0c0a24',

  // Glassy translucent surfaces layered over the gradient.
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceStrong: 'rgba(255, 255, 255, 0.10)',
  surfaceBorder: 'rgba(255, 255, 255, 0.12)',

  accent: '#a78bfa',
  accentDeep: '#7c5cff',
  accentSoft: 'rgba(167, 139, 250, 0.18)',

  text: '#f4f2ff',
  textDim: 'rgba(244, 242, 255, 0.62)',
  textFaint: 'rgba(244, 242, 255, 0.38)',

  star: '#ffd166',
  starEmpty: 'rgba(244, 242, 255, 0.18)',

  tileBackground: 'rgba(255, 255, 255, 0.05)',
  hintHighlight: '#ffb347',
  success: '#5be59a',
  reject: '#ff7c9c',
  lock: 'rgba(244, 242, 255, 0.28)',
  overlay: 'rgba(7, 6, 19, 0.82)',
} as const;

export type GameColors = typeof Game;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radii = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  captionBold: { fontSize: 13, fontWeight: '600' as const },
  mono: { fontSize: 14, fontWeight: '400' as const, fontVariant: ['tabular-nums'] as const },
} as const;

export const TileAnimation = {
  slideDurationMs: 120,
  shakeDurationMs: 200,
  hintPulseDurationMs: 400,
} as const;
