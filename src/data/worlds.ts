// Per-world accent (plus gradient/frame) is owned by `worldThemes.ts`, and the
// real level count is derived from `levels.ts` via the `worldProgress` selector.
// The world record here is just identity + copy + its unlock gate.
export type World = {
  id: string;
  title: string;
  description: string;
  unlockStarThreshold: number;
};

// Each world in menu order costs 5 more cumulative stars than the previous one
// to unlock. Stars are hard-earned, so the step is intentionally small.
export const UNLOCK_STARS_PER_WORLD = 5;

type WorldSeed = Omit<World, 'unlockStarThreshold'>;

// Order interleaves concrete and abstract themes; muster and glyphen are kept
// apart on purpose.
const WORLD_SEEDS: WorldSeed[] = [
  { id: 'natur', title: 'Natur', description: 'Tiere und Landschaften' },
  { id: 'muster', title: 'Muster', description: 'Geometrische Muster und Farbverläufe' },
  { id: 'planeten', title: 'Planeten', description: 'Welten, Monde und Ringe' },
  { id: 'fahrzeuge', title: 'Fahrzeuge', description: 'Autos, Schiffe und Flieger' },
  { id: 'glyphen', title: 'Glyphen', description: 'Linien, Zahlen und neue Formen' },
  { id: 'sport', title: 'Sportarten', description: 'Spielszenen und Action' },
  { id: 'kosmos', title: 'Kosmos', description: 'Nebel, Sterne und Tiefe' },
  { id: 'urban', title: 'Urban', description: 'Städte, Fassaden und Neon' },
];

export const WORLDS: World[] = WORLD_SEEDS.map((seed, index) => ({
  ...seed,
  unlockStarThreshold: index * UNLOCK_STARS_PER_WORLD,
}));

export function getWorld(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}
