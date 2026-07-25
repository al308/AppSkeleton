import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { TILE_BORDER_RADIUS } from '../../constants/layout';
import { Game } from '../../constants/theme';
import type { TensionLevel } from '../ui/TensionGlow';

// Pulse speed scales with tension: a leisurely glow at level 1, a noticeably
// faster one by level 3.
const PULSE_DURATION_MS: Record<TensionLevel, number> = {
  0: 0,
  1: 1600,
  2: 1100,
  3: 700,
};

type Props = {
  level: TensionLevel;
};

export function BoardGlow({ level }: Props): React.ReactElement | null {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (level === 0) {
      opacity.value = 0;
      return;
    }
    opacity.value = withRepeat(withTiming(0.9, { duration: PULSE_DURATION_MS[level] }), -1, true);
  }, [level, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (level === 0) return null;

  return (
    <Animated.View testID="board-glow" pointerEvents="none" style={[styles.ring, animStyle]} />
  );
}

const styles = StyleSheet.create({
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TILE_BORDER_RADIUS,
    borderWidth: 2,
    borderColor: Game.accent,
  },
});
