import { useCallback, useMemo, useState } from 'react';
import { PuzzleState, Move, applyMove } from '../engine/puzzle';
import { buildTrainingPlan, TrainingPhase, planMoves } from '../engine/trainingPlan';
import { TrainingLesson, trainingStartState } from '../data/training';

export type TrainingStep = {
  move: Move;
  phaseIndex: number;
};

export type TrainingSession = {
  puzzleState: PuzzleState;
  // The move the player is expected to make next, or null once the lesson is done.
  expectedMove: Move | null;
  // The phase currently being taught, or null once the lesson is done.
  currentPhase: TrainingPhase | null;
  currentPhaseIndex: number;
  phaseCount: number;
  // 0-based index of the next move across the whole lesson, and the total.
  stepIndex: number;
  stepCount: number;
  isComplete: boolean;
  // Applies the move only if it matches the expected schema move. Returns true when the
  // move was accepted (and the session advanced), false when it was rejected — the
  // caller plays the usual invalid-move feedback. Wrong moves never change state, so the
  // player can never leave the optimal teaching path.
  tryMove: (tileIndex: number) => boolean;
  restart: () => void;
};

// Pre-computes the full row-by-row lesson once, then walks the player through it move by
// move. Deliberately store-free: training is a transient, non-scored experience, so it
// shares none of the persistence of the real game loop (see usePuzzle).
export function useTrainingSession(lesson: TrainingLesson): TrainingSession {
  const start = useMemo(() => trainingStartState(lesson), [lesson]);
  const plan = useMemo(() => buildTrainingPlan(start), [start]);

  const steps = useMemo<TrainingStep[]>(() => {
    const out: TrainingStep[] = [];
    plan.phases.forEach((phase, phaseIndex) => {
      for (const move of phase.moves) out.push({ move, phaseIndex });
    });
    return out;
  }, [plan]);

  const [puzzleState, setPuzzleState] = useState<PuzzleState>(start);
  const [stepIndex, setStepIndex] = useState(0);

  const isComplete = stepIndex >= steps.length;
  const currentStep = isComplete ? null : (steps[stepIndex] ?? null);
  const expectedMove = currentStep ? currentStep.move : null;
  const currentPhaseIndex = currentStep ? currentStep.phaseIndex : plan.phases.length;
  const currentPhase = currentStep ? (plan.phases[currentStep.phaseIndex] ?? null) : null;

  const tryMove = useCallback(
    (tileIndex: number): boolean => {
      if (!expectedMove || tileIndex !== expectedMove.from) return false;
      setPuzzleState((prev) => applyMove(prev, tileIndex));
      setStepIndex((i) => i + 1);
      return true;
    },
    [expectedMove],
  );

  const restart = useCallback(() => {
    setPuzzleState(start);
    setStepIndex(0);
  }, [start]);

  return {
    puzzleState,
    expectedMove,
    currentPhase,
    currentPhaseIndex,
    phaseCount: plan.phases.length,
    stepIndex,
    stepCount: steps.length,
    isComplete,
    tryMove,
    restart,
  };
}

// Exposed for tests: the canonical solution move sequence for a lesson.
export function lessonSolutionMoves(lesson: TrainingLesson): Move[] {
  return planMoves(buildTrainingPlan(trainingStartState(lesson)));
}
