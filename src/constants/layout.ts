export const BOARD_MAX_SIZE = 520;
export const BOARD_MAX_SIZE_TABLET = 680;
// A board is considered to be on a tablet-class screen when its shorter side
// clears this threshold; phones stay capped at BOARD_MAX_SIZE.
export const TABLET_MIN_SHORT_SIDE = 700;
export const BOARD_SCREEN_RATIO = 0.9;
export const TILE_GAP = 2;
export const TILE_BORDER_RADIUS = 5;

// Vertical chrome above/below the board on the game screen: the floating top bar
// plus screen padding. In portrait the HUD also stacks under the board; in
// landscape the HUD sits beside it, so only the top bar eats height there.
const TOP_BAR_RESERVE = 64;
const HUD_RESERVE = 96;

// Sizes the square board to the largest value that fits the available space in
// the current orientation, leaving room for the top bar (always) and the HUD
// (only when it stacks below the board, i.e. portrait). Without this the board
// — sized at 0.9 of the shorter side — overflows the height in phone landscape,
// where the shorter side *is* the height and chrome has nowhere to go.
export function computeBoardSize(screenWidth: number, screenHeight: number): number {
  const isLandscape = screenWidth > screenHeight;
  const shortSide = Math.min(screenWidth, screenHeight);
  const maxSize = shortSide >= TABLET_MIN_SHORT_SIDE ? BOARD_MAX_SIZE_TABLET : BOARD_MAX_SIZE;

  const widthBudget = screenWidth * BOARD_SCREEN_RATIO - (isLandscape ? HUD_RESERVE : 0);
  const heightBudget = screenHeight - TOP_BAR_RESERVE - (isLandscape ? 0 : HUD_RESERVE);

  return Math.max(0, Math.min(widthBudget, heightBudget, maxSize));
}

export function computeTileSize(boardSize: number, gridSize: number): number {
  return (boardSize - TILE_GAP * (gridSize - 1)) / gridSize;
}
