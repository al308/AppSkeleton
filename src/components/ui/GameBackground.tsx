import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Game } from '../../constants/theme';
import { getWorldTheme } from '../../data/worldThemes';
import { TensionGlow, type TensionLevel } from './TensionGlow';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | undefined;
  // When set, the backdrop uses that world's gradient so each world reads as its
  // own place. Omitted on neutral screens (menu shell), which keep the default.
  worldId?: string | undefined;
  // How close the player is to finishing the puzzle (see `tensionLevelFor` in
  // `engine/solver.ts`). Overlays a warmer tint on top of the base gradient,
  // fading in as the level rises. Omitted/0 leaves the backdrop untouched.
  tensionLevel?: TensionLevel | undefined;
};

// Shared atmospheric backdrop for every game-facing screen. Without a world it
// uses the neutral game gradient; with one it switches to that world's palette.
export function GameBackground({
  children,
  style,
  worldId,
  tensionLevel = 0,
}: Props): React.ReactElement {
  const colors = worldId ? getWorldTheme(worldId).gradient : Game.bgGradient;
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.fill, style]}
    >
      <TensionGlow level={tensionLevel} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
