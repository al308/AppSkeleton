import type { ImageAssetKey } from './images';

// Per-world visual identity. Each world reads as its own place: a distinct
// backdrop gradient, accent, and tile/board frame color. `backgroundImage` is an
// optional slot reserved for a future organic texture/backdrop PNG — when one is
// produced it drops in here (plus an images.ts registry entry) with no other
// schema change. Until then the rendered backdrop is purely the gradient.
export type WorldTheme = {
  gradient: readonly [string, string, string]; // backdrop, top -> bottom
  accent: string; // primary accent (highlights, dots)
  frame: string; // tile/board/cover frame color
  backgroundImage?: ImageAssetKey;
};

// Falls back to the neutral game backdrop when a world has no explicit theme.
export const DEFAULT_WORLD_THEME: WorldTheme = {
  gradient: ['#1a1740', '#0c0a24', '#070613'],
  accent: '#a78bfa',
  frame: 'rgba(255, 255, 255, 0.12)',
};

export const WORLD_THEMES: Record<string, WorldTheme> = {
  natur: {
    gradient: ['#15351f', '#0c2114', '#06120b'],
    accent: '#5be59a',
    frame: 'rgba(91, 229, 154, 0.30)',
  },
  muster: {
    gradient: ['#3a153f', '#220c2b', '#100616'],
    accent: '#d68bff',
    frame: 'rgba(214, 139, 255, 0.30)',
  },
  glyphen: {
    gradient: ['#0f3a3a', '#082525', '#041313'],
    accent: '#4fd6c8',
    frame: 'rgba(79, 214, 200, 0.30)',
  },
  planeten: {
    gradient: ['#3a230a', '#241405', '#120902'],
    accent: '#ffa94d',
    frame: 'rgba(255, 169, 77, 0.30)',
  },
  fahrzeuge: {
    gradient: ['#3a1212', '#240a0a', '#120404'],
    accent: '#ff7a85',
    frame: 'rgba(255, 122, 133, 0.30)',
  },
  sport: {
    gradient: ['#0d2747', '#07182c', '#030c16'],
    accent: '#5aa8ff',
    frame: 'rgba(90, 168, 255, 0.30)',
  },
  kosmos: {
    gradient: ['#241046', '#15082b', '#0a0416'],
    accent: '#b388ff',
    frame: 'rgba(179, 136, 255, 0.30)',
  },
  urban: {
    gradient: ['#0a2e33', '#061d21', '#030f11'],
    accent: '#4fd8e6',
    frame: 'rgba(79, 216, 230, 0.30)',
  },
};

export function getWorldTheme(worldId: string | undefined): WorldTheme {
  if (!worldId) return DEFAULT_WORLD_THEME;
  return WORLD_THEMES[worldId] ?? DEFAULT_WORLD_THEME;
}
