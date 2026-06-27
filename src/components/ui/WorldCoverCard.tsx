import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { World } from '../../data/worlds';
import { WorldProgress } from '../../store/selectors';
import { Game, Spacing, Radii, Typography } from '../../constants/theme';

type Props = {
  world: World;
  progress: WorldProgress;
  isUnlocked: boolean;
  onPress: () => void;
};

// A 3x3 mini-puzzle motif: one tile is "empty" (the gap) so it reads as a
// sliding puzzle rather than a plain grid. Filled tiles tint toward the world
// accent; the gap is transparent.
const GAP_INDEX = 5;

function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

function MiniPuzzle({ accent }: { accent: string }): React.ReactElement {
  return (
    <View style={styles.motif} accessible={false} importantForAccessibility="no-hide-descendants">
      {Array.from({ length: 9 }, (_, i) => (
        <View
          key={i}
          style={[
            styles.motifTile,
            i === GAP_INDEX
              ? styles.motifGap
              : { backgroundColor: hexWithAlpha(accent, i % 2 === 0 ? 0.9 : 0.6) },
          ]}
        />
      ))}
    </View>
  );
}

export function WorldCoverCard({
  world,
  progress,
  isUnlocked,
  onPress,
}: Props): React.ReactElement {
  const { solvedCount, totalLevels, earnedStars, maxStars } = progress;
  const a11yLabel = isUnlocked
    ? `Welt ${world.title}. ${solvedCount} von ${totalLevels} Puzzles gelöst, ${earnedStars} von ${maxStars} Sternen.`
    : `Welt ${world.title}, gesperrt. Sammle ${world.unlockStarThreshold} Sterne zum Freischalten.`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && isUnlocked && styles.pressed]}
      onPress={onPress}
      disabled={!isUnlocked}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled: !isUnlocked }}
    >
      <LinearGradient
        colors={[hexWithAlpha(world.accentColor, 0.55), hexWithAlpha(world.accentColor, 0.12)]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.cover, !isUnlocked && styles.coverLocked]}
      >
        <MiniPuzzle accent={world.accentColor} />

        {!isUnlocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockHint}>★ {world.unlockStarThreshold} zum Freischalten</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.title}>{world.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {world.description}
          </Text>

          <View style={styles.stats}>
            <Text style={styles.statSolved}>
              {solvedCount}/{totalLevels} gelöst
            </Text>
            <Text style={styles.statStars}>
              <Text style={styles.star}>★ </Text>
              {earnedStars}/{maxStars}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: Game.surface,
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  cover: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  coverLocked: { opacity: 0.6 },
  motif: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    marginTop: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  motifTile: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
  },
  motifGap: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
    borderStyle: 'dashed',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  lockIcon: { fontSize: 40 },
  lockHint: { ...Typography.captionBold, color: Game.text },
  footer: { gap: 2 },
  title: { ...Typography.h1, color: Game.text },
  subtitle: { ...Typography.caption, color: Game.textDim },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  statSolved: { ...Typography.bodyBold, color: Game.text },
  statStars: { ...Typography.bodyBold, color: Game.text },
  star: { color: Game.star },
});
