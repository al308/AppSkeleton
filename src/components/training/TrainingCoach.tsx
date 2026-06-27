import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TrainingPhaseCopy } from '../../data/training';
import { Game, Spacing, Radii, Typography } from '../../constants/theme';

type Props = {
  // The copy for the phase currently being taught. Null once the lesson is complete.
  phase: TrainingPhaseCopy | null;
  phaseIndex: number;
  phaseCount: number;
  // Whole-lesson progress, used for the step counter.
  stepIndex: number;
  stepCount: number;
  isComplete: boolean;
  completionText: string;
};

// The instructional strip beneath the board: names the current schema phase, explains
// its objective, and shows progress. The narrative describes the *phase goal* rather
// than each tile, because one phase legitimately nudges several tiles around.
export function TrainingCoach({
  phase,
  phaseIndex,
  phaseCount,
  stepIndex,
  stepCount,
  isComplete,
  completionText,
}: Props): React.ReactElement {
  if (isComplete) {
    return (
      <View style={[styles.card, styles.cardDone]} accessibilityLiveRegion="polite">
        <Text style={styles.doneTitle}>Geschafft!</Text>
        <Text style={styles.body}>{completionText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={styles.header}>
        <Text style={styles.phaseLabel}>
          Schritt {phaseIndex + 1}/{phaseCount}
        </Text>
        <View style={styles.dots} accessibilityElementsHidden>
          {Array.from({ length: phaseCount }, (_, i) => (
            <View key={i} style={[styles.dot, i <= phaseIndex && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.moveCounter}>
          Zug {Math.min(stepIndex + 1, stepCount)}/{stepCount}
        </Text>
      </View>
      <Text style={styles.title}>{phase?.title ?? ''}</Text>
      <Text style={styles.body}>{phase?.body ?? ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: Game.surfaceStrong,
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
    gap: Spacing.xs,
  },
  cardDone: {
    borderColor: Game.success,
    backgroundColor: 'rgba(91, 229, 154, 0.12)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  phaseLabel: { ...Typography.captionBold, color: Game.hintHighlight },
  moveCounter: { ...Typography.caption, color: Game.textDim },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Game.starEmpty,
  },
  dotActive: { backgroundColor: Game.hintHighlight },
  title: { ...Typography.h3, color: Game.text },
  doneTitle: { ...Typography.h3, color: Game.success },
  body: { ...Typography.body, color: Game.textDim, lineHeight: 22 },
});
