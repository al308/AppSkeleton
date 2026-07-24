import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { WORLDS } from '../data/worlds';

export type Stars = 1 | 2 | 3;

export type PuzzleRecord = {
  levelId: string;
  completions: number;
  bestMoves: number;
  bestTime: number;
  stars: Stars;
  lastPlayedAt: string;
  hintsUsedTotal: number;
};

type ProgressState = {
  records: Record<string, PuzzleRecord>;
  unlockedWorldIds: string[];
};

type ProgressActions = {
  recordCompletion: (params: {
    levelId: string;
    moves: number;
    time: number;
    stars: Stars;
    hintsUsed: number;
  }) => void;
  unlockWorld: (worldId: string) => void;
  unlockAllWorlds: () => void;
  getRecord: (levelId: string) => PuzzleRecord | undefined;
  reset: () => void;
};

const INITIAL: ProgressState = {
  records: {},
  unlockedWorldIds: ['natur'],
};

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      recordCompletion: ({ levelId, moves, time, stars, hintsUsed }) => {
        set((state) => {
          const existing = state.records[levelId];
          const updated: PuzzleRecord = {
            levelId,
            completions: (existing?.completions ?? 0) + 1,
            bestMoves: existing ? Math.min(existing.bestMoves, moves) : moves,
            bestTime: existing ? Math.min(existing.bestTime, time) : time,
            stars: existing ? (Math.max(existing.stars, stars) as Stars) : stars,
            lastPlayedAt: new Date().toISOString(),
            hintsUsedTotal: (existing?.hintsUsedTotal ?? 0) + hintsUsed,
          };
          const records = { ...state.records, [levelId]: updated };
          return {
            records,
            unlockedWorldIds: worldsUnlockedBy(records, state.unlockedWorldIds),
          };
        });
      },
      unlockWorld: (worldId) => {
        set((state) => ({
          unlockedWorldIds: state.unlockedWorldIds.includes(worldId)
            ? state.unlockedWorldIds
            : [...state.unlockedWorldIds, worldId],
        }));
      },
      unlockAllWorlds: () => {
        set(() => ({ unlockedWorldIds: WORLDS.map((world) => world.id) }));
      },
      getRecord: (levelId) => get().records[levelId],
      reset: () => set(INITIAL),
    }),
    {
      name: 'shiffle.progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// A world unlocks once the player's total earned stars reach its threshold.
// Returns the unlocked set, preserving any already-unlocked worlds.
export function worldsUnlockedBy(
  records: Record<string, PuzzleRecord>,
  alreadyUnlocked: string[],
): string[] {
  const totalStars = Object.values(records).reduce((sum, r) => sum + r.stars, 0);
  const unlocked = new Set(alreadyUnlocked);
  for (const world of WORLDS) {
    if (totalStars >= world.unlockStarThreshold) unlocked.add(world.id);
  }
  return unlocked.size === alreadyUnlocked.length ? alreadyUnlocked : Array.from(unlocked);
}

export function computeStars(moves: number, optimalMoves: number | undefined): Stars {
  if (!optimalMoves) return 1;
  if (moves <= Math.ceil(optimalMoves * 1.3)) return 3;
  if (moves <= optimalMoves * 2) return 2;
  return 1;
}
