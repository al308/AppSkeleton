export type World = {
  id: string;
  title: string;
  description: string;
  accentColor: string;
  unlockStarThreshold: number;
  totalLevels: number;
};

export const WORLDS: World[] = [
  {
    id: 'natur',
    title: 'Natur',
    description: 'Tiere und Landschaften',
    accentColor: '#43a047',
    unlockStarThreshold: 0,
    totalLevels: 9,
  },
  {
    id: 'muster',
    title: 'Muster',
    description: 'Geometrische Muster und Farbverläufe',
    accentColor: '#7b1fa2',
    unlockStarThreshold: 18,
    totalLevels: 15,
  },
  {
    id: 'glyphen',
    title: 'Glyphen',
    description: 'Linien, Zahlen und neue Formen',
    accentColor: '#00897b',
    unlockStarThreshold: 36,
    totalLevels: 12,
  },
];

export function getWorld(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}
