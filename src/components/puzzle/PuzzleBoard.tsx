import React, { useCallback } from 'react';
import { StyleSheet, ImageSourcePropType } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PuzzleState } from '../../engine/puzzle';
import { PuzzleTile } from './PuzzleTile';
import { derivePatternTiles, GlyphMotif } from '../../engine/patterns';
import { Level } from '../../data/levels';
import { resolveImageAsset } from '../../data/images';
import { TILE_GAP, TILE_BORDER_RADIUS } from '../../constants/layout';

const SWIPE_THRESHOLD = 10;

type Props = {
  level: Level;
  puzzleState: PuzzleState;
  boardSize: number;
  tileSize: number;
  onMove: (tileIndex: number) => boolean;
  hintedTileIndex: number | null;
  hintStep: number;
  showNumbers: boolean;
  hapticsEnabled: boolean;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
};

export function PuzzleBoard({
  level,
  puzzleState,
  boardSize,
  tileSize,
  onMove,
  hintedTileIndex,
  hintStep,
  showNumbers,
  hapticsEnabled,
  accentColor,
  backgroundColor,
  textColor,
}: Props): React.ReactElement {
  const { tiles, size } = puzzleState;
  const shakeX = useSharedValue(0);

  const patternTiles =
    level.source.kind === 'pattern' ? derivePatternTiles(level.source.pattern, size) : null;
  const patternGlyph = level.source.kind === 'pattern' ? level.source.pattern.glyph : undefined;
  const patternForceNumber =
    level.source.kind === 'pattern' && level.source.pattern.style === 'number';

  const imageSource: ImageSourcePropType | undefined =
    level.source.kind === 'image' ? resolveImageAsset(level.source.asset) : undefined;

  const triggerHaptic = useCallback(
    (valid: boolean) => {
      if (!hapticsEnabled) return;
      if (valid) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    },
    [hapticsEnabled],
  );

  const playInvalidShake = useCallback(() => {
    triggerHaptic(false);
    shakeX.value = withSequence(
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 40 }),
      withTiming(-4, { duration: 40 }),
      withTiming(4, { duration: 40 }),
      withTiming(0, { duration: 40 }),
    );
  }, [triggerHaptic, shakeX]);

  const handleTap = useCallback(
    (tileIndex: number) => {
      const valid = onMove(tileIndex);
      if (valid) {
        triggerHaptic(true);
      } else {
        playInvalidShake();
      }
    },
    [onMove, triggerHaptic, playInvalidShake],
  );

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const col = Math.floor(e.x / (tileSize + TILE_GAP));
    const row = Math.floor(e.y / (tileSize + TILE_GAP));
    const idx = row * size + col;
    if (idx >= 0 && idx < size * size) {
      runOnJS(handleTap)(idx);
    }
  });

  const panGesture = Gesture.Pan()
    .minDistance(SWIPE_THRESHOLD)
    .onEnd((e) => {
      const col = Math.floor(e.x / (tileSize + TILE_GAP));
      const row = Math.floor(e.y / (tileSize + TILE_GAP));
      const tileIdx = row * size + col;
      if (tileIdx < 0 || tileIdx >= size * size) return;
      // You grab a tile and push it; the empty cell isn't grabbable.
      if (tiles[tileIdx] === 0) return;

      const { translationX: dx, translationY: dy } = e;
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

      // The grabbed tile may only slide if the blank sits in the swipe
      // direction. Reject swipes off-board or against a non-blank neighbor so a
      // wrong-direction swipe shakes instead of silently moving another tile.
      let neighborIdx: number;
      if (Math.abs(dx) > Math.abs(dy)) {
        if ((dx > 0 && col === size - 1) || (dx < 0 && col === 0)) return;
        neighborIdx = dx > 0 ? tileIdx + 1 : tileIdx - 1;
      } else {
        if ((dy > 0 && row === size - 1) || (dy < 0 && row === 0)) return;
        neighborIdx = dy > 0 ? tileIdx + size : tileIdx - size;
      }

      if (tiles[neighborIdx] !== 0) {
        // Blank isn't where the swipe points — invalid, let it shake.
        runOnJS(playInvalidShake)();
        return;
      }

      runOnJS(handleTap)(tileIdx);
    });

  const composed = Gesture.Race(tapGesture, panGesture);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[styles.board, { width: boardSize, height: boardSize, backgroundColor }, shakeStyle]}
        accessible
        accessibilityLabel={`Puzzle ${size}×${size}`}
      >
        {tiles.map((tileId, positionIndex) => {
          if (tileId === 0) return null;
          const patternColor = patternTiles?.find((t) => t.tileId === tileId)?.color;
          const isHinted = hintedTileIndex === positionIndex;

          return (
            <StaticTile
              key={tileId}
              tileId={tileId}
              positionIndex={positionIndex}
              gridSize={size}
              tileSize={tileSize}
              imageSource={imageSource}
              patternColor={patternColor}
              glyph={patternGlyph}
              forceNumber={patternForceNumber}
              showNumber={showNumbers}
              isHinted={isHinted}
              hintStep={isHinted ? hintStep + 1 : undefined}
              textColor={textColor}
              accentColor={accentColor}
            />
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
}

// Wrapper that owns its own shared values — never created inside a map callback
type StaticTileProps = {
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
};

function StaticTile(props: StaticTileProps): React.ReactElement | null {
  const animX = useSharedValue(0);
  const animY = useSharedValue(0);
  return <PuzzleTile {...props} animX={animX} animY={animY} />;
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    borderRadius: TILE_BORDER_RADIUS,
    overflow: 'hidden',
  },
});
