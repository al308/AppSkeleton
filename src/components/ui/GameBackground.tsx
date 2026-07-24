import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Game } from '../../constants/theme';
import { getWorldTheme } from '../../data/worldThemes';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | undefined;
  // When set, the backdrop uses that world's gradient so each world reads as its
  // own place. Omitted on neutral screens (menu shell), which keep the default.
  worldId?: string | undefined;
};

// Shared atmospheric backdrop for every game-facing screen. Without a world it
// uses the neutral game gradient; with one it switches to that world's palette.
export function GameBackground({ children, style, worldId }: Props): React.ReactElement {
  const colors = worldId ? getWorldTheme(worldId).gradient : Game.bgGradient;
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
