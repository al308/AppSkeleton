import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Game } from '../../constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | undefined;
};

// Shared atmospheric backdrop for every game-facing screen. A single gradient
// definition keeps the whole game visually coherent.
export function GameBackground({ children, style }: Props): React.ReactElement {
  return (
    <LinearGradient
      colors={Game.bgGradient}
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
