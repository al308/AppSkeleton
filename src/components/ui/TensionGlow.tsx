import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Game } from '../../constants/theme';

export type TensionLevel = 0 | 1 | 2 | 3;

const FADE_DURATION_MS = 400;

// Opacity of the warm overlay at each tension level — level 0 is fully
// transparent (identical to no overlay at all), 1-3 escalate.
const OPACITY_BY_LEVEL: Record<TensionLevel, number> = {
  0: 0,
  1: 0.16,
  2: 0.3,
  3: 0.46,
};

// A single precomputed tint gradient, blended toward warmer accent/star tones
// as the player nears the goal. Crossfading this one static layer in and out
// (rather than interpolating each gradient stop's color) keeps the animation
// cheap and avoids per-channel color math on the UI thread.
const TENSION_COLORS = [Game.accentDeep, Game.accent, Game.star] as const;

type Props = {
  level: TensionLevel;
};

export function TensionGlow({ level }: Props): React.ReactElement {
  const opacity = useSharedValue(OPACITY_BY_LEVEL[level]);

  useEffect(() => {
    opacity.value = withTiming(OPACITY_BY_LEVEL[level], { duration: FADE_DURATION_MS });
  }, [level, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View testID="tension-glow" pointerEvents="none" style={[styles.fill, animStyle]}>
      <LinearGradient
        colors={TENSION_COLORS}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.fill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
