import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Game } from '../../constants/theme';

// A brief accent flash pulsed across the screen at the moment a level is won,
// synced to the same trigger as the confetti burst rather than the completion
// modal's own (delayed) haptic timer.
export function WinFlash(): React.ReactElement {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(0.35, { duration: 120 }),
      withTiming(0, { duration: 400 }),
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      testID="win-flash"
      pointerEvents="none"
      style={[styles.fill, { backgroundColor: Game.accent }, animStyle]}
    />
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
