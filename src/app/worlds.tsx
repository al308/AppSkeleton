import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WORLDS } from '../data/worlds';
import { TRAINING_LESSONS } from '../data/training';
import { useProgressStore } from '../store/progressStore';
import { worldProgress } from '../store/selectors';
import { WorldCarousel, type WorldEntry } from '../components/ui/WorldCarousel';
import { GameBackground } from '../components/ui/GameBackground';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { Game, Spacing, Typography } from '../constants/theme';
import { DEV_UNLOCK_ALL } from '../constants/devFlags';

export default function WorldsScreen(): React.ReactElement {
  const router = useRouter();
  const { records, unlockedWorldIds, devUnlockAll } = useProgressStore();
  const reduceMotion = useReduceMotion();

  const entries: WorldEntry[] = WORLDS.map((world) => ({
    world,
    progress: worldProgress(records, world),
    isUnlocked: DEV_UNLOCK_ALL || devUnlockAll || unlockedWorldIds.includes(world.id),
  }));

  const totalStars = entries.reduce((sum, e) => sum + e.progress.earnedStars, 0);

  return (
    <GameBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Zurück"
            accessibilityRole="button"
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.kicker}>Wähle eine Welt</Text>
            <Text style={styles.appTitle}>Welten</Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityLabel="Einstellungen"
            accessibilityRole="button"
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.starBanner}>
          <Text style={styles.starBannerText}>
            <Text style={styles.starBannerStar}>★ </Text>
            {totalStars} Sterne gesammelt
          </Text>
        </View>

        <View style={styles.content}>
          <Pressable
            onPress={() => router.push(`/training/${TRAINING_LESSONS[0]?.id ?? ''}`)}
            accessibilityRole="button"
            accessibilityLabel="Training starten — lerne, Schiebepuzzles nach Schema zu lösen"
            style={({ pressed }) => [styles.trainingCard, pressed && styles.trainingCardPressed]}
          >
            <View style={styles.trainingTextWrap}>
              <Text style={styles.trainingKicker}>Neu hier?</Text>
              <Text style={styles.trainingTitle}>Training</Text>
              <Text style={styles.trainingSub}>
                Lerne das Lösungs-Schema in zwei kurzen Lektionen.
              </Text>
            </View>
            <Text style={styles.trainingChevron}>›</Text>
          </Pressable>
        </View>

        <WorldCarousel
          entries={entries}
          reduceMotion={reduceMotion}
          onSelect={(worldId) => router.push(`/world/${worldId}`)}
        />
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  kicker: {
    ...Typography.captionBold,
    color: Game.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Game.text,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Game.surface,
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 30, color: Game.text, marginTop: -2 },
  settingsIcon: { fontSize: 22, color: Game.textDim },
  starBanner: {
    alignSelf: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    backgroundColor: Game.accentSoft,
  },
  starBannerText: {
    ...Typography.captionBold,
    color: Game.text,
  },
  starBannerStar: { color: Game.star },
  content: { paddingHorizontal: Spacing.lg },
  trainingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: 20,
    backgroundColor: Game.accentSoft,
    borderWidth: 1,
    borderColor: Game.accent,
  },
  trainingCardPressed: { opacity: 0.85 },
  trainingTextWrap: { flex: 1, gap: 2 },
  trainingKicker: {
    ...Typography.captionBold,
    color: Game.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  trainingTitle: { ...Typography.h2, color: Game.text },
  trainingSub: { ...Typography.caption, color: Game.textDim, marginTop: 2 },
  trainingChevron: { fontSize: 32, color: Game.accent, marginLeft: Spacing.md },
});
