import type { World } from '../data/worlds';
import { getLevelsForWorld } from '../data/levels';
import type { PuzzleRecord } from './progressStore';

export type WorldProgress = {
  solvedCount: number;
  totalLevels: number;
  earnedStars: number;
  maxStars: number;
};

export function worldProgress(records: Record<string, PuzzleRecord>, world: World): WorldProgress {
  const levels = getLevelsForWorld(world.id);
  let solvedCount = 0;
  let earnedStars = 0;
  for (const level of levels) {
    const stars = records[level.id]?.stars ?? 0;
    if (stars > 0) solvedCount += 1;
    earnedStars += stars;
  }
  return {
    solvedCount,
    totalLevels: levels.length,
    earnedStars,
    maxStars: levels.length * 3,
  };
}
