import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSound } from '../../audio/soundEffects';
import { StarRating } from '../ui/StarRating';
import { GameButton } from '../ui/GameButton';
import { Game, Spacing, Radii, Typography } from '../../constants/theme';
import { Stars } from '../../store/progressStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PRAISE: Record<Stars, string> = {
  3: 'Perfekt gelöst!',
  2: 'Stark gemacht!',
  1: 'Geschafft!',
};

type Props = {
  visible: boolean;
  stars: Stars;
  moveCount: number;
  bestMoves: number;
  isNewBest: boolean;
  elapsedSeconds: number;
  optimalMoves?: number | undefined;
  onReplay: () => void;
  onNext: () => void;
  onMenu: () => void;
};

export function CompletionModal({
  visible,
  stars,
  moveCount,
  bestMoves,
  isNewBest,
  elapsedSeconds,
  optimalMoves,
  onReplay,
  onNext,
  onMenu,
}: Props): React.ReactElement {
  const slideY = useSharedValue(320);
  const opacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      slideY.value = withDelay(
        150,
        withTiming(0, { duration: 420, easing: Easing.out(Easing.back(1.4)) }),
      );
      badgeScale.value = withDelay(280, withSpring(1, { damping: 8, stiffness: 130 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('level-complete-fanfare');
      playSound('star-earned');
      if (isNewBest) playSound('new-best-record');
    } else {
      slideY.value = 320;
      opacity.value = 0;
      badgeScale.value = 0;
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const efficiency = optimalMoves ? Math.round((optimalMoves / moveCount) * 100) : null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Animated.View style={[styles.starsWrap, badgeStyle]}>
            <StarRating stars={stars} size={42} starColor={Game.star} emptyColor={Game.starEmpty} />
          </Animated.View>

          <Text style={styles.praise}>{PRAISE[stars]}</Text>
          {isNewBest && <Text style={styles.bestTag}>🏆 Neue Bestleistung</Text>}

          <View style={styles.stats}>
            <StatRow label="Züge" value={String(moveCount)} />
            <StatRow label="Beste" value={String(bestMoves)} />
            <StatRow label="Zeit" value={formatTime(elapsedSeconds)} />
            {optimalMoves && <StatRow label="Optimal" value={`~${optimalMoves}`} />}
            {efficiency !== null && <StatRow label="Effizienz" value={`${efficiency}%`} />}
          </View>

          <View style={styles.buttons}>
            <GameButton label="Nochmal" variant="ghost" onPress={onReplay} style={styles.flexBtn} />
            <GameButton label="Weiter ▶" onPress={onNext} style={styles.flexBtn} />
          </View>

          <Text style={styles.menuLink} onPress={onMenu} accessibilityRole="button">
            Zum Menü
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function StatRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Game.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#161334',
    borderTopWidth: 1,
    borderColor: Game.surfaceBorder,
  },
  starsWrap: { marginBottom: Spacing.xs },
  praise: { ...Typography.h2, color: Game.text },
  bestTag: { ...Typography.captionBold, color: Game.star },
  stats: {
    width: '100%',
    gap: 2,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  statLabel: { ...Typography.body, color: Game.textDim },
  statValue: { ...Typography.bodyBold, color: Game.text, fontVariant: ['tabular-nums'] },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  flexBtn: { flex: 1 },
  menuLink: {
    ...Typography.caption,
    color: Game.textDim,
    marginTop: Spacing.sm,
    padding: Spacing.xs,
  },
});
