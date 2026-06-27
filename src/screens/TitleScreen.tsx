import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Game, Spacing } from '../constants/theme';
import { LEVELS } from '../data/levels';
import { useProgressStore } from '../store/progressStore';

const logoImage = require('../../assets/icon.png');

const TABLET_MIN_WIDTH = 768;

type Props = {
  onPlay: () => void;
  onSettings: () => void;
  onTraining: () => void;
};

type Scale = {
  columnWidth: number;
  logoSize: number;
  titleSize: number;
  buttonPaddingVertical: number;
  primaryFontSize: number;
  secondaryFontSize: number;
  gap: number;
};

function useTitleScale(): Scale {
  const { width, height } = useWindowDimensions();
  const shortEdge = Math.min(width, height);
  const isTablet = shortEdge >= TABLET_MIN_WIDTH;

  if (!isTablet) {
    return {
      columnWidth: Math.min(300, width - 64),
      logoSize: Math.min(140, width * 0.36),
      titleSize: 44,
      buttonPaddingVertical: 16,
      primaryFontSize: 19,
      secondaryFontSize: 17,
      gap: 14,
    };
  }
  return {
    columnWidth: Math.min(440, width * 0.5),
    logoSize: 200,
    titleSize: 64,
    buttonPaddingVertical: 22,
    primaryFontSize: 26,
    secondaryFontSize: 23,
    gap: 20,
  };
}

type TitleButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  scale: Scale;
  variant: 'primary' | 'secondary';
};

function TitleButton({
  label,
  onPress,
  accessibilityLabel,
  scale,
  variant,
}: TitleButtonProps): React.ReactElement {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        { paddingVertical: scale.buttonPaddingVertical },
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          primary ? styles.buttonPrimaryLabel : styles.buttonSecondaryLabel,
          { fontSize: primary ? scale.primaryFontSize : scale.secondaryFontSize },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TitleScreen({ onPlay, onSettings, onTraining }: Props): React.ReactElement {
  const records = useProgressStore((state) => state.records);
  const scale = useTitleScale();

  const solvedCount = Object.values(records).filter((r) => r.stars > 0).length;
  const totalStars = Object.values(records).reduce((sum, r) => sum + r.stars, 0);
  const progressLine =
    solvedCount > 0
      ? `${solvedCount} / ${LEVELS.length} Puzzles gelöst · ★ ${totalStars}`
      : `${LEVELS.length} Puzzles warten auf dich`;

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Image
            source={logoImage}
            style={[styles.logo, { width: scale.logoSize, height: scale.logoSize }]}
            resizeMode="contain"
            accessibilityLabel="Shiffle Logo"
          />
          <Text style={[styles.title, { fontSize: scale.titleSize }]}>SHIFFLE</Text>
          <Text style={styles.tagline}>Slide. Solve. Relax.</Text>
        </View>

        <View style={[styles.menuColumn, { width: scale.columnWidth, gap: scale.gap }]}>
          <TitleButton
            label="Spielen"
            onPress={onPlay}
            accessibilityLabel="Spielen — Welten öffnen"
            scale={scale}
            variant="primary"
          />
          <TitleButton
            label="Training"
            onPress={onTraining}
            accessibilityLabel="Training starten"
            scale={scale}
            variant="secondary"
          />
          <TitleButton
            label="Einstellungen"
            onPress={onSettings}
            accessibilityLabel="Einstellungen öffnen"
            scale={scale}
            variant="secondary"
          />
          <Text style={styles.progress}>{progressLine}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Game.bgSolid,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logo: {
    borderRadius: 32,
    marginBottom: Spacing.md,
  },
  title: {
    color: Game.text,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
  },
  tagline: {
    color: Game.accent,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 3,
    textAlign: 'center',
  },
  menuColumn: {
    alignSelf: 'center',
    alignItems: 'stretch',
  },
  button: {
    borderRadius: 16,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: Game.accent,
  },
  buttonSecondary: {
    backgroundColor: Game.surface,
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
  },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  buttonPrimaryLabel: {
    color: Game.bgSolid,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  buttonSecondaryLabel: {
    color: Game.text,
    fontWeight: '700',
    letterSpacing: 1,
  },
  progress: {
    color: Game.textDim,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
