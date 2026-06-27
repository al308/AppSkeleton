import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle } from 'react-native';
import { Game, Spacing, Radii, Typography } from '../../constants/theme';

type Variant = 'primary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle | undefined;
  accessibilityLabel?: string | undefined;
};

// Pill-shaped action button matching the game's visual language. `primary`
// is the filled call-to-action; `ghost` is a bordered secondary choice.
export function GameButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  accessibilityLabel,
}: Props): React.ReactElement {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelGhost]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Game.accentDeep,
  },
  ghost: {
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
    backgroundColor: Game.surface,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...Typography.bodyBold,
    letterSpacing: 0.3,
  },
  labelPrimary: { color: '#ffffff' },
  labelGhost: { color: Game.text },
});
