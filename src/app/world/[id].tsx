import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLevelsForWorld, Level } from '../../data/levels';
import { getWorld } from '../../data/worlds';
import { getWorldTheme } from '../../data/worldThemes';
import { useProgressStore } from '../../store/progressStore';
import { useGameStore } from '../../store/gameStore';
import { LevelCard } from '../../components/ui/LevelCard';
import { GameBackground } from '../../components/ui/GameBackground';
import { Game, Spacing, Typography } from '../../constants/theme';
import { DEV_UNLOCK_ALL } from '../../constants/devFlags';
import { playSound } from '../../audio/soundEffects';
import { playWorldMusic, stopMusic } from '../../audio/musicPlayer';

const COLUMNS = 3;

export default function WorldScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { records, devUnlockAll } = useProgressStore();
  const activeGame = useGameStore((s) => s.activeGame);

  const world = getWorld(id);
  const levels = getLevelsForWorld(id);

  useEffect(() => {
    if (world) playWorldMusic(world.id);
    return () => stopMusic();
  }, [world?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isUnlocked = (_level: Level, index: number): boolean => {
    if (DEV_UNLOCK_ALL || devUnlockAll) return true;
    if (index === 0) return true;
    const prev = levels[index - 1];
    return prev ? records[prev.id] !== undefined : false;
  };

  const earnedStars = levels.reduce((sum, l) => sum + (records[l.id]?.stars ?? 0), 0);
  const maxStars = levels.length * 3;

  if (!world) {
    return (
      <GameBackground>
        <View style={styles.center}>
          <Text style={styles.notFound}>Welt nicht gefunden.</Text>
        </View>
      </GameBackground>
    );
  }

  return (
    <GameBackground worldId={world.id}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              playSound('nav-back');
              router.back();
            }}
            accessibilityLabel="Zurück"
            accessibilityRole="button"
            hitSlop={10}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <View style={[styles.dot, { backgroundColor: getWorldTheme(world.id).accent }]} />
              <Text style={styles.worldTitle}>{world.title}</Text>
            </View>
            <Text style={styles.worldDesc}>{world.description}</Text>
          </View>
          <View style={styles.starPill}>
            <Text style={styles.starPillText}>
              <Text style={styles.star}>★ </Text>
              {earnedStars}/{maxStars}
            </Text>
          </View>
        </View>

        <FlatList
          data={levels}
          numColumns={COLUMNS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={styles.cell}>
              <LevelCard
                level={item}
                record={records[item.id]}
                isUnlocked={isUnlocked(item, index)}
                isActive={activeGame?.levelId === item.id}
                index={index}
                onPress={() => router.push(`/game/${item.id}`)}
              />
            </View>
          )}
        />
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { ...Typography.body, color: Game.text },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Game.surface,
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 28, lineHeight: 30, color: Game.text },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  worldTitle: { ...Typography.h2, color: Game.text },
  worldDesc: { ...Typography.caption, color: Game.textDim },
  starPill: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: 999,
    backgroundColor: Game.accentSoft,
  },
  starPillText: { ...Typography.captionBold, color: Game.text },
  star: { color: Game.star },
  grid: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  cell: { flex: 1 },
});
