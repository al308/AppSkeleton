import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { TILE_BORDER_RADIUS, TILE_GAP } from '../../constants/layout';
import { Game } from '../../constants/theme';

const PULSE_DURATION_MS = 900;

type Props = {
  positionIndex: number;
  gridSize: number;
  tileSize: number;
  enabled: boolean;
};

export function BlankGlow({
  positionIndex,
  gridSize,
  tileSize,
  enabled,
}: Props): React.ReactElement | null {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    if (!enabled) {
      opacity.value = 0.25;
      return;
    }
    opacity.value = withRepeat(withTiming(0.7, { duration: PULSE_DURATION_MS }), -1, true);
  }, [enabled, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!enabled) return null;

  const row = Math.floor(positionIndex / gridSize);
  const col = positionIndex % gridSize;
  const baseX = col * (tileSize + TILE_GAP);
  const baseY = row * (tileSize + TILE_GAP);

  return (
    <Animated.View
      testID="blank-glow"
      pointerEvents="none"
      style={[
        styles.glow,
        {
          width: tileSize,
          height: tileSize,
          borderRadius: TILE_BORDER_RADIUS,
          transform: [{ translateX: baseX }, { translateY: baseY }],
          backgroundColor: Game.accentSoft,
        },
        animStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
});
