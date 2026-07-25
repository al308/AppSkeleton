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
import { AnimatedTile } from './AnimatedTile';
import { BlankGlow } from './BlankGlow';
import { BoardGlow } from './BoardGlow';
import { derivePatternTiles } from '../../engine/patterns';
import { Level } from '../../data/levels';
import { resolveImageAsset } from '../../data/images';
import { TILE_GAP, TILE_BORDER_RADIUS } from '../../constants/layout';
import type { ControlMode } from '../../store/settingsStore';
import type { TensionLevel } from '../ui/TensionGlow';

// A swipe only needs to clear a small distance before it counts — keeping this
// low makes the gesture feel responsive instead of "dead" on short flicks.
const SWIPE_THRESHOLD = 8;

type TapGesture = ReturnType<typeof Gesture.Tap>;
type PanGesture = ReturnType<typeof Gesture.Pan>;
type BoardGesture = TapGesture | PanGesture | ReturnType<typeof Gesture.Race>;

// Honor the player's chosen control scheme. `both` races the two so whichever
// the finger performs first wins; `tap`/`swipe` enable exactly one.
export function selectGesture(mode: ControlMode, tap: TapGesture, pan: PanGesture): BoardGesture {
  switch (mode) {
    case 'tap':
      return tap;
    case 'swipe':
      return pan;
    case 'both':
      return Gesture.Race(tap, pan);
  }
}

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
  controlMode: ControlMode;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  animationsEnabled?: boolean | undefined;
  tensionLevel?: TensionLevel | undefined;
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
  controlMode,
  accentColor,
  backgroundColor,
  textColor,
  animationsEnabled = true,
  tensionLevel = 0,
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
    const cell = tileSize + TILE_GAP;
    const col = Math.min(size - 1, Math.max(0, Math.floor(e.x / cell)));
    const row = Math.min(size - 1, Math.max(0, Math.floor(e.y / cell)));
    runOnJS(handleTap)(row * size + col);
  });

  const panGesture = Gesture.Pan()
    .minDistance(SWIPE_THRESHOLD)
    .onEnd((e) => {
      // Hit-test the tile the swipe started on. Clamp to the grid so a touch
      // that begins a hair outside the board edge still maps to the edge tile
      // instead of being silently dropped.
      const cell = tileSize + TILE_GAP;
      const col = Math.min(size - 1, Math.max(0, Math.floor(e.x / cell)));
      const row = Math.min(size - 1, Math.max(0, Math.floor(e.y / cell)));
      const tileIdx = row * size + col;
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

  const composed = selectGesture(controlMode, tapGesture, panGesture);

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
          if (tileId === 0) {
            return (
              <BlankGlow
                key="blank"
                positionIndex={positionIndex}
                gridSize={size}
                tileSize={tileSize}
                enabled={animationsEnabled}
              />
            );
          }
          const patternColor = patternTiles?.find((t) => t.tileId === tileId)?.color;
          const isHinted = hintedTileIndex === positionIndex;

          return (
            <AnimatedTile
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
              animationsEnabled={animationsEnabled}
            />
          );
        })}
        <BoardGlow level={tensionLevel} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    borderRadius: TILE_BORDER_RADIUS,
    overflow: 'hidden',
  },
});
