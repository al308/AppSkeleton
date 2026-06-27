import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Game, Typography, Spacing, Radii } from '../../constants/theme';
import { RemainingEstimate } from '../../engine/solver';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatRemaining(remaining: RemainingEstimate): string {
  if (remaining.kind === 'unknown') return '';
  if (remaining.moves === 0) return '0';
  return remaining.kind === 'exact' ? String(remaining.moves) : `≥${remaining.moves}`;
}

type Props = {
  elapsedSeconds: number;
  moveCount: number;
  remaining: RemainingEstimate;
  hintsRemaining: number;
  showTimer: boolean;
  showMoves: boolean;
  showRemaining: boolean;
  onHintPress: () => void;
  onMenuPress: () => void;
  layout?: 'bar' | 'column';
};

export function HUD({
  elapsedSeconds,
  moveCount,
  remaining,
  hintsRemaining,
  showTimer,
  showMoves,
  showRemaining,
  onHintPress,
  onMenuPress,
  layout = 'bar',
}: Props): React.ReactElement {
  const noHints = hintsRemaining === 0;
  const isColumn = layout === 'column';
  return (
    <View style={[styles.container, isColumn && styles.containerColumn]}>
      <View style={[styles.stats, isColumn && styles.statsColumn]}>
        {showTimer && <HUDStat label="Zeit" value={formatTime(elapsedSeconds)} />}
        {showMoves && <HUDStat label="Züge" value={String(moveCount)} />}
        {showRemaining && remaining.kind !== 'unknown' && (
          <HUDStat label="Bis Ziel" value={formatRemaining(remaining)} highlight />
        )}
      </View>

      <View style={[styles.actions, isColumn && styles.actionsColumn]}>
        <Pressable
          onPress={onHintPress}
          disabled={noHints}
          style={[styles.actionButton, noHints && styles.actionDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Tipp anzeigen"
          accessibilityHint={`${hintsRemaining} Tipps übrig`}
        >
          <Text style={styles.actionIcon}>💡</Text>
          {hintsRemaining > 0 && (
            <View style={styles.hintBadge}>
              <Text style={styles.hintBadgeText}>{hintsRemaining}</Text>
            </View>
          )}
        </Pressable>
        <Pressable
          onPress={onMenuPress}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel="Menü öffnen"
        >
          <Text style={styles.actionIcon}>⏸</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HUDStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}): React.ReactElement {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.lg,
    backgroundColor: Game.surface,
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
  },
  containerColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statsColumn: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  stat: { alignItems: 'center' },
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Game.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    ...Typography.h3,
    color: Game.text,
    fontVariant: ['tabular-nums'],
  },
  statValueHighlight: { color: Game.accent },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionsColumn: {
    justifyContent: 'center',
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Game.surfaceStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDisabled: { opacity: 0.4 },
  actionIcon: { fontSize: 18 },
  hintBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: Game.accentDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
