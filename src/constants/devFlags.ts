// ⚠️ RELEASE GATE — must be `false` before any store build.
//
// When true, every world and every level is unlocked regardless of progress,
// so the game can be explored end to end during development. The real
// progression mechanic (unlock next level on completion, unlock next world at
// the star threshold) is still implemented and takes over the moment this is
// flipped back to false.
//
// Release gate satisfied: progression is live (worlds unlock at their star
// threshold via worldsUnlockedBy in progressStore).
export const DEV_UNLOCK_ALL = false;
