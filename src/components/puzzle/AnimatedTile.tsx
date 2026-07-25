import React, { useEffect, useRef } from 'react';
import { ImageSourcePropType } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { PuzzleTile } from './PuzzleTile';
import { GlyphMotif } from '../../engine/patterns';
import { TILE_GAP } from '../../constants/layout';
import { TileAnimation } from '../../constants/theme';

// Wrapper that owns its own shared values — never created inside a map callback
type Props = {
  tileId: number;
  positionIndex: number;
  gridSize: number;
  tileSize: number;
  imageSource?: ImageSourcePropType | undefined;
  patternColor?: string | undefined;
  glyph?: GlyphMotif | undefined;
  forceNumber?: boolean | undefined;
  showNumber: boolean;
  isHinted: boolean;
  hintStep?: number | undefined;
  textColor: string;
  accentColor: string;
  animationsEnabled: boolean;
};

export function AnimatedTile({
  positionIndex,
  gridSize,
  tileSize,
  animationsEnabled,
  ...rest
}: Props): React.ReactElement | null {
  const animX = useSharedValue(0);
  const animY = useSharedValue(0);
  const prevPositionIndex = useRef(positionIndex);

  useEffect(() => {
    const prev = prevPositionIndex.current;
    prevPositionIndex.current = positionIndex;
    if (prev === positionIndex) return;

    if (!animationsEnabled) {
      animX.value = 0;
      animY.value = 0;
      return;
    }

    const cell = tileSize + TILE_GAP;
    const prevCol = prev % gridSize;
    const prevRow = Math.floor(prev / gridSize);
    const col = positionIndex % gridSize;
    const row = Math.floor(positionIndex / gridSize);

    // Snap to the old offset (relative to the new base position) in the same
    // commit as the position change, then animate back to 0 — the tile reads
    // as sliding from its old cell instead of jumping.
    animX.value = (prevCol - col) * cell;
    animY.value = (prevRow - row) * cell;
    animX.value = withTiming(0, { duration: TileAnimation.slideDurationMs });
    animY.value = withTiming(0, { duration: TileAnimation.slideDurationMs });
  }, [positionIndex, animationsEnabled, gridSize, tileSize, animX, animY]);

  return (
    <PuzzleTile
      {...rest}
      positionIndex={positionIndex}
      gridSize={gridSize}
      tileSize={tileSize}
      animX={animX}
      animY={animY}
      animationsEnabled={animationsEnabled}
    />
  );
}
