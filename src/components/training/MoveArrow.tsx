import React, { useEffect } from 'react';
import { StyleSheet, View, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Move } from '../../engine/puzzle';
import { getTilePosition } from '../../engine/tileLayout';
import { Game } from '../../constants/theme';

export type SlideDirection = 'up' | 'down' | 'left' | 'right';

// Which way the tile slides to fill the blank. `from` is the tile, `to` is the blank.
export function slideDirection(move: Move, gridSize: number): SlideDirection {
  const delta = move.to - move.from;
  if (delta === -gridSize) return 'up';
  if (delta === gridSize) return 'down';
  if (delta === -1) return 'left';
  return 'right';
}

const ROTATION: Record<SlideDirection, string> = {
  up: '-90deg',
  down: '90deg',
  left: '180deg',
  right: '0deg',
};

// The chevron's transform: a directional rotation plus the glide offset. Both must share
// one array — keeping them apart lets an animated transform clobber the rotation, which
// would leave every arrow pointing right. Exposed so a test can guard that the rotation
// is never dropped.
type ArrowTransform = ({ translateX: number } | { translateY: number } | { rotate: string })[];

export function arrowTransform(direction: SlideDirection, offset: number): ArrowTransform {
  'worklet';
  const translate =
    direction === 'left' || direction === 'right'
      ? { translateX: direction === 'right' ? offset : -offset }
      : { translateY: direction === 'down' ? offset : -offset };
  return [translate, { rotate: ROTATION[direction] }];
}

type Props = {
  move: Move;
  gridSize: number;
  tileSize: number;
  gap: number;
  reduceMotion?: boolean;
};

// A pulsing chevron drawn on top of the tile the player should slide next, pointing
// toward the blank. Built from two rotated bars (a `>` shape) so it needs no SVG/asset.
// Respects reduce-motion: when motion is disabled (or forced off via prop) it renders a
// steady chevron instead of the gliding pulse.
export function MoveArrow({
  move,
  gridSize,
  tileSize,
  gap,
  reduceMotion,
}: Props): React.ReactElement {
  const [systemReduceMotion, setSystemReduceMotion] = React.useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setSystemReduceMotion(enabled);
      })
      .catch(() => {
        // Availability of this API varies by platform; default to motion on.
      });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  const motionOff = reduceMotion ?? systemReduceMotion;

  useEffect(() => {
    if (motionOff) {
      progress.value = 0;
      return;
    }
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [motionOff, progress]);

  const direction = slideDirection(move, gridSize);
  const { x, y } = getTilePosition(move.from, gridSize, tileSize, gap);
  const glide = Math.max(4, tileSize * 0.12);

  const pulseStyle = useAnimatedStyle(() => {
    // `still` is 1 when motion is disabled: the chevron then sits centered and fully
    // opaque instead of gliding. Otherwise it glides from one side to the other.
    const still = motionOff ? 1 : 0;
    const t = progress.value;
    const offset = still ? 0 : (t - 0.5) * 2 * glide;
    return {
      opacity: still ? 1 : 0.55 + t * 0.45,
      transform: arrowTransform(direction, offset),
    };
  });

  // A chevron built from a square with only two adjacent borders: rotated 45° it reads
  // as a clean `›` pointing right. `rotation` (from the slide direction) then turns the
  // whole arrow to point at the blank.
  const headSize = tileSize * 0.26;
  const headThickness = Math.max(3, tileSize * 0.06);

  return (
    <View
      testID="move-arrow"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.cell, { left: x, top: y, width: tileSize, height: tileSize }]}
    >
      <Animated.View style={[styles.chevron, pulseStyle]}>
        <View
          style={{
            width: headSize,
            height: headSize,
            borderTopWidth: headThickness,
            borderRightWidth: headThickness,
            borderColor: Game.hintHighlight,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
