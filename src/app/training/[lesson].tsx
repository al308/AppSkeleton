import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, AccessibilityInfo } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBackground } from '../../components/ui/GameBackground';
import { GameButton } from '../../components/ui/GameButton';
import { PuzzleBoard } from '../../components/puzzle/PuzzleBoard';
import { MoveArrow } from '../../components/training/MoveArrow';
import { GhostTarget } from '../../components/training/GhostTarget';
import { TrainingCoach } from '../../components/training/TrainingCoach';
import { useOrientation } from '../../hooks/useOrientation';
import { useTrainingSession } from '../../hooks/useTrainingSession';
import { TRAINING_LESSONS, getTrainingLesson, TrainingLesson } from '../../data/training';
import { Level } from '../../data/levels';
import { TILE_GAP } from '../../constants/layout';
import { Game, Spacing, Typography } from '../../constants/theme';

// A teaching board uses a synthetic pattern level (no image asset needed) and always
// shows tile numbers — the numbers are the learner's anchor for tracking each tile.
function syntheticLevel(lesson: TrainingLesson): Level {
  return {
    id: `training-${lesson.id}`,
    world: 'training',
    title: lesson.title,
    gridSize: lesson.gridSize,
    source: { kind: 'pattern', pattern: { shape: 'gradient_r', colorCount: 6, palette: 'cool' } },
    shuffleDepth: 'relaxed',
    shuffleSeed: 0,
    hintsAllowed: 0,
  };
}

function nextLessonId(currentId: string): string | null {
  const idx = TRAINING_LESSONS.findIndex((l) => l.id === currentId);
  if (idx === -1) return null;
  const next = TRAINING_LESSONS[idx + 1];
  return next ? next.id : null;
}

export default function TrainingScreen(): React.ReactElement {
  const { lesson: lessonId } = useLocalSearchParams<{ lesson: string }>();
  const router = useRouter();
  const lesson = getTrainingLesson(lessonId);

  if (!lesson) {
    return (
      <GameBackground>
        <SafeAreaView style={styles.center}>
          <Text style={styles.notFound}>Lektion nicht gefunden.</Text>
          <GameButton label="Zurück" variant="ghost" onPress={() => router.replace('/')} />
        </SafeAreaView>
      </GameBackground>
    );
  }

  return <TrainingLessonView key={lesson.id} lesson={lesson} />;
}

function TrainingLessonView({ lesson }: { lesson: TrainingLesson }): React.ReactElement {
  const router = useRouter();
  const { boardSize, tileSize, orientation } = useOrientation();
  const isLandscape = orientation === 'landscape';
  const session = useTrainingSession(lesson);
  const level = useMemo(() => syntheticLevel(lesson), [lesson]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => undefined);
  }, []);

  const ts = tileSize(lesson.gridSize);

  // Only the schema move is accepted; any other tile shakes via the board's own feedback.
  const handleMove = useCallback(
    (tileIndex: number): boolean => session.tryMove(tileIndex),
    [session],
  );

  const advance = nextLessonId(lesson.id);
  const handleContinue = useCallback(() => {
    if (advance) router.replace(`/training/${advance}`);
    else router.replace('/');
  }, [advance, router]);

  return (
    <GameBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.replace('/')}
            accessibilityLabel="Training verlassen"
            accessibilityRole="button"
            hitSlop={10}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text style={styles.sub}>{lesson.subtitle}</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.stage, isLandscape && styles.stageLandscape]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.boardArea, { width: boardSize, height: boardSize }]}>
            <PuzzleBoard
              level={level}
              puzzleState={session.puzzleState}
              boardSize={boardSize}
              tileSize={ts}
              onMove={handleMove}
              hintedTileIndex={null}
              hintStep={0}
              showNumbers
              hapticsEnabled
              accentColor={Game.hintHighlight}
              backgroundColor={Game.tileBackground}
              textColor={Game.text}
            />
            {session.expectedMove && (
              <>
                <GhostTarget
                  puzzleState={session.puzzleState}
                  movingFrom={session.expectedMove.from}
                  tileSize={ts}
                  gap={TILE_GAP}
                  showNumber
                />
                <MoveArrow
                  move={session.expectedMove}
                  gridSize={lesson.gridSize}
                  tileSize={ts}
                  gap={TILE_GAP}
                  reduceMotion={reduceMotion}
                />
              </>
            )}
          </View>

          <View style={styles.coachArea}>
            {session.stepIndex === 0 && !session.isComplete && (
              <Text style={styles.intro}>{lesson.intro}</Text>
            )}
            <TrainingCoach
              phase={
                session.currentPhase ? (lesson.phaseCopy[session.currentPhaseIndex] ?? null) : null
              }
              phaseIndex={session.currentPhaseIndex}
              phaseCount={session.phaseCount}
              stepIndex={session.stepIndex}
              stepCount={session.stepCount}
              isComplete={session.isComplete}
              completionText={lesson.outro}
            />

            {session.isComplete ? (
              <View style={styles.actions}>
                <GameButton
                  label={advance ? 'Nächste Lektion' : 'Fertig'}
                  onPress={handleContinue}
                />
                <GameButton label="Nochmal" variant="ghost" onPress={session.restart} />
              </View>
            ) : (
              <Pressable onPress={session.restart} hitSlop={8} accessibilityRole="button">
                <Text style={styles.reset}>Neu starten</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  notFound: { ...Typography.body, color: Game.text },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
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
  title: { ...Typography.h3, color: Game.text, flexShrink: 1 },
  sub: { ...Typography.caption, color: Game.textDim, marginLeft: 'auto' },
  stage: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  stageLandscape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: Spacing.xl,
  },
  boardArea: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  coachArea: { width: '100%', maxWidth: 520, gap: Spacing.md },
  intro: {
    ...Typography.body,
    color: Game.textDim,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  actions: { gap: Spacing.sm },
  reset: {
    ...Typography.captionBold,
    color: Game.textDim,
    textAlign: 'center',
    paddingVertical: Spacing.xs,
  },
});
