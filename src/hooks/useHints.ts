import { useState, useCallback } from 'react';
import { InteractionManager } from 'react-native';
import { PuzzleState, Move } from '../engine/puzzle';
import { computeHint, HintResult } from '../engine/solver';
import { useGameStore } from '../store/gameStore';

type HintState = {
  activeHints: Move[];
  currentHintStep: number;
  isComputing: boolean;
  lastResult: HintResult | null;
};

type HintActions = {
  requestHint: (state: PuzzleState, steps: 1 | 3) => void;
  advanceHintStep: () => void;
  cancelHints: () => void;
  hintsRemaining: number;
};

export function useHints(hintsAllowed: number): HintState & HintActions {
  const hintsUsed = useGameStore((s) => s.activeGame?.hintsUsed ?? 0);

  const [activeHints, setActiveHints] = useState<Move[]>([]);
  const [currentHintStep, setCurrentHintStep] = useState(0);
  const [isComputing, setIsComputing] = useState(false);
  const [lastResult, setLastResult] = useState<HintResult | null>(null);

  const hintsRemaining = hintsAllowed - hintsUsed;

  const requestHint = useCallback(
    (state: PuzzleState, steps: 1 | 3) => {
      const cost = steps === 1 ? 1 : 2;
      if (hintsRemaining < cost) return;

      setIsComputing(true);
      InteractionManager.runAfterInteractions(() => {
        const result = computeHint(state, steps);
        setLastResult(result);
        if (result.type === 'moves') {
          setActiveHints(result.moves);
          setCurrentHintStep(0);
          useGameStore.setState((s) => ({
            activeGame: s.activeGame
              ? { ...s.activeGame, hintsUsed: s.activeGame.hintsUsed + cost }
              : s.activeGame,
          }));
        }
        setIsComputing(false);
      });
    },
    [hintsRemaining],
  );

  const advanceHintStep = useCallback(() => {
    setCurrentHintStep((s) => Math.min(s + 1, activeHints.length - 1));
  }, [activeHints.length]);

  const cancelHints = useCallback(() => {
    setActiveHints([]);
    setCurrentHintStep(0);
  }, []);

  return {
    activeHints,
    currentHintStep,
    isComputing,
    lastResult,
    requestHint,
    advanceHintStep,
    cancelHints,
    hintsRemaining,
  };
}
