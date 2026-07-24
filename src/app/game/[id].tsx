import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, AccessibilityInfo } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getLevel,
  getNextLevel,
  levelRequiresExactOrder,
  effectiveOptimalMoves,
} from '../../data/levels';
import { shuffleFromSeed } from '../../engine/shuffle';
import { useGameStore } from '../../store/gameStore';
import { useProgressStore, computeStars } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePuzzle } from '../../hooks/usePuzzle';
import { useTimer } from '../../hooks/useTimer';
import { useOrientation } from '../../hooks/useOrientation';
import { PuzzleBoard } from '../../components/puzzle/PuzzleBoard';
import { SolutionReference } from '../../components/puzzle/SolutionReference';
import { HUD } from '../../components/ui/HUD';
import { GameButton } from '../../components/ui/GameButton';
import { GameBackground } from '../../components/ui/GameBackground';
import { CompletionModal } from '../../components/celebration/CompletionModal';
import { ConfettiEmitter } from '../../components/celebration/ConfettiEmitter';
import { Game, Spacing, Typography, Radii } from '../../constants/theme';
import { PuzzleState } from '../../engine/puzzle';
import { remainingMoves, RemainingEstimate } from '../../engine/solver';

export default function GameScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { boardSize, tileSize, orientation, screenWidth, screenHeight } = useOrientation();
  const isTablet = Math.min(screenWidth, screenHeight) >= 700;
  const isLandscape = orientation === 'landscape';

  const level = getLevel(id);
  const activeGame = useGameStore((s) => s.activeGame);
  const { startGame, tickTimer } = useGameStore();
  const { records } = useProgressStore();
  const settings = useSettingsStore();

  const [showPause, setShowPause] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [coachmarkVisible, setCoachmarkVisible] = useState(false);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const initialState: PuzzleState = useMemo(() => {
    if (!level) return { tiles: [], size: 3, blankIndex: 0 };
    if (activeGame?.levelId === level.id) return activeGame.puzzleState;
    return shuffleFromSeed(level.gridSize, level.shuffleDepth, level.shuffleSeed);
  }, [level?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!level) return;
    const isResume = activeGame?.levelId === level.id;
    if (!isResume) {
      startGame({ levelId: level.id, initialState, hintsAllowed: level.hintsAllowed });
      if (!settings.coachmarkDismissed) setCoachmarkVisible(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [level?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { puzzleState, moveCount, isWon, tryMove, restart, hints } = usePuzzle(
    level!,
    initialState,
  );

  // Optimal moves left, recomputed only when the arrangement changes. Exact for
  // small grids; a Manhattan lower bound (shown as "≥N") otherwise. Pattern
  // levels solved by color group have no meaningful numeric-goal distance, so the
  // estimate is hidden — but when numbers are shown the goal IS numeric, so show it.
  const exactOrder = level ? levelRequiresExactOrder(level, settings.tileNumbersVisible) : false;
  const hidesEstimate = level?.source.kind === 'pattern' && !exactOrder;
  const remaining: RemainingEstimate = useMemo(
    () => remainingMoves(puzzleState, hidesEstimate),
    [puzzleState, hidesEstimate],
  );

  const handleTick = useCallback((s: number) => tickTimer(s), [tickTimer]);
  useTimer({ isRunning: isTimerRunning && !showPause && !isWon, onTick: handleTick });

  const handleMove = useCallback(
    (tileIndex: number): boolean => {
      const valid = tryMove(tileIndex);
      if (valid && !hasMovedRef.current) {
        hasMovedRef.current = true;
        setIsTimerRunning(true);
        if (coachmarkVisible) {
          setCoachmarkVisible(false);
          settings.setSetting('coachmarkDismissed', true);
        }
      }
      return valid;
    },
    [tryMove, coachmarkVisible, settings],
  );

  useEffect(() => {
    if (!isWon) return;
    setIsTimerRunning(false);
    if (!reduceMotion) setShowConfetti(true);
    const t = setTimeout(() => setShowCompletion(true), reduceMotion ? 0 : 1200);
    return () => clearTimeout(t);
  }, [isWon, reduceMotion]);

  const handleReplay = useCallback(() => {
    setShowCompletion(false);
    setShowConfetti(false);
    hasMovedRef.current = false;
    restart();
    setIsTimerRunning(false);
  }, [restart]);

  const handleNext = useCallback(() => {
    if (!level) return;
    const next = getNextLevel(level.id);
    setShowCompletion(false);
    setShowConfetti(false);
    if (next) {
      router.replace(`/game/${next.id}`);
    } else {
      router.back();
    }
  }, [level, router]);

  const handleHint = useCallback(() => {
    if (hints.hintsRemaining <= 0) return;
    hints.requestHint(puzzleState, 1);
  }, [hints, puzzleState]);

  const hintedPositionIndex: number | null = useMemo(() => {
    if (hints.activeHints.length === 0) return null;
    const move = hints.activeHints[hints.currentHintStep];
    return move ? move.from : null;
  }, [hints.activeHints, hints.currentHintStep]);

  const elapsedSeconds = activeGame?.elapsedSeconds ?? 0;
  const record = records[level?.id ?? ''];
  const effectiveOpt = level
    ? effectiveOptimalMoves(level, settings.tileNumbersVisible)
    : undefined;
  const stars = computeStars(moveCount, effectiveOpt);
  const isNewBest = record ? moveCount < record.bestMoves : true;

  if (!level) {
    return (
      <GameBackground>
        <View style={styles.center}>
          <Text style={styles.notFound}>Level nicht gefunden.</Text>
        </View>
      </GameBackground>
    );
  }

  const ts = tileSize(level.gridSize);

  // Reference placement adapts to the available space. The corner PiP overlaps
  // a tile, so it's only used where there genuinely is no room beside/above the
  // board — i.e. a phone in portrait. Everywhere with spare space (any tablet,
  // or a phone in landscape) the default is promoted to the non-overlapping
  // "side" block, which the layout places beside the board in landscape and
  // above it in portrait.
  const hasRoomForSide = isTablet || orientation === 'landscape';
  const refMode: typeof settings.referenceMode =
    settings.referenceMode === 'pip' || settings.referenceMode === 'side'
      ? hasRoomForSide
        ? 'side'
        : 'pip'
      : settings.referenceMode;

  return (
    <GameBackground worldId={level.world}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => setShowPause(true)}
            accessibilityLabel="Zurück"
            accessibilityRole="button"
            hitSlop={10}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.levelTitle} numberOfLines={1}>
            {level.title}
          </Text>
          <View style={styles.backBtn} />
        </View>

        <View style={[styles.stage, isLandscape && styles.stageLandscape]}>
          {refMode === 'side' ? (
            <View style={[styles.flank, isLandscape && styles.flankLandscape]}>
              <SolutionReference
                level={level}
                mode="side"
                boardSize={boardSize}
                sideMax={isLandscape ? 280 : 160}
              />
            </View>
          ) : (
            isLandscape && <View style={[styles.flank, styles.flankLandscape]} />
          )}

          <View style={[styles.boardArea, { width: boardSize, height: boardSize }]}>
            {refMode === 'ghost' && (
              <SolutionReference level={level} mode="ghost" boardSize={boardSize} />
            )}
            <PuzzleBoard
              level={level}
              puzzleState={puzzleState}
              boardSize={boardSize}
              tileSize={ts}
              onMove={handleMove}
              hintedTileIndex={hintedPositionIndex}
              hintStep={hints.currentHintStep}
              showNumbers={settings.tileNumbersVisible}
              hapticsEnabled={settings.hapticsEnabled}
              controlMode={settings.controlMode}
              accentColor={Game.hintHighlight}
              backgroundColor={Game.tileBackground}
              textColor={Game.text}
            />
            {refMode === 'pip' && (
              <SolutionReference level={level} mode="pip" boardSize={boardSize} />
            )}
            {coachmarkVisible && (
              <View style={styles.coachmark}>
                <Text style={styles.coachmarkText}>Wische eine Kachel in Richtung der Lücke.</Text>
              </View>
            )}
          </View>

          <View style={[styles.flank, isLandscape && styles.flankLandscape]}>
            <HUD
              elapsedSeconds={elapsedSeconds}
              moveCount={moveCount}
              remaining={remaining}
              hintsRemaining={hints.hintsRemaining}
              showTimer={settings.timerVisible}
              showMoves={settings.moveCounterVisible}
              showRemaining={settings.optimalMovesVisible}
              onHintPress={handleHint}
              onMenuPress={() => setShowPause(true)}
              layout={isLandscape ? 'column' : 'bar'}
            />
          </View>
        </View>

        {showConfetti && <ConfettiEmitter onFinished={() => setShowConfetti(false)} />}

        <CompletionModal
          visible={showCompletion}
          stars={stars}
          moveCount={moveCount}
          bestMoves={record ? Math.min(record.bestMoves, moveCount) : moveCount}
          isNewBest={isNewBest}
          elapsedSeconds={elapsedSeconds}
          optimalMoves={effectiveOpt}
          onReplay={handleReplay}
          onNext={handleNext}
          onMenu={() => router.replace('/')}
        />

        <Modal visible={showPause} transparent animationType="fade">
          <View style={styles.pauseOverlay}>
            <View style={styles.pauseCard}>
              <Text style={styles.pauseTitle}>Pause</Text>
              <GameButton label="Weiter spielen" onPress={() => setShowPause(false)} />
              <GameButton
                label="Neustart"
                variant="ghost"
                onPress={() => {
                  setShowPause(false);
                  handleReplay();
                }}
              />
              <GameButton
                label="Einstellungen"
                variant="ghost"
                onPress={() => {
                  setShowPause(false);
                  router.push('/settings');
                }}
              />
              <GameButton label="Zum Menü" variant="ghost" onPress={() => router.replace('/')} />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { ...Typography.body, color: Game.text },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
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
  levelTitle: { ...Typography.h3, color: Game.text, flex: 1, textAlign: 'center' },
  // The stage holds three children — target flank, board, HUD flank — and keeps
  // the square board optically centered. In portrait they stack as full-width
  // rows; in landscape they sit as columns with the board fixed in the middle
  // and the two flanks given equal weight so the board never drifts.
  stage: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stageLandscape: {
    maxWidth: 1320,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.xl,
  },
  boardArea: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  flank: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // In landscape the flanks stretch to the board's full height and pin their
  // content to the top, lifting the target image and HUD into the space above
  // the board instead of leaving it empty.
  flankLandscape: {
    flex: 1,
    width: 'auto',
    minWidth: 0,
    justifyContent: 'flex-start',
    paddingTop: Spacing.xs,
  },
  coachmark: {
    position: 'absolute',
    bottom: -56,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    marginHorizontal: Spacing.md,
    backgroundColor: Game.surfaceStrong,
  },
  coachmarkText: { ...Typography.caption, color: Game.text, textAlign: 'center' },
  pauseOverlay: {
    flex: 1,
    backgroundColor: Game.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  pauseCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: '#161334',
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
  },
  pauseTitle: {
    ...Typography.h2,
    color: Game.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
});
