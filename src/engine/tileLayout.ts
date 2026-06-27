export type TileOffset = {
  translateX: number;
  translateY: number;
};

export function getTileOffset(tileId: number, gridSize: number, tileSize: number): TileOffset {
  if (tileId === 0) return { translateX: 0, translateY: 0 };
  const idx = tileId - 1;
  const row = Math.floor(idx / gridSize);
  const col = idx % gridSize;
  return {
    translateX: -(col * tileSize),
    translateY: -(row * tileSize),
  };
}

export function getTilePosition(
  positionIndex: number,
  gridSize: number,
  tileSize: number,
  gap: number,
): { x: number; y: number } {
  const row = Math.floor(positionIndex / gridSize);
  const col = positionIndex % gridSize;
  return {
    x: col * (tileSize + gap),
    y: row * (tileSize + gap),
  };
}
