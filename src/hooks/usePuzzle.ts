import { useState, useCallback, useEffect, useRef } from 'react';
import { PuzzleState, isValidMove, applyMove, isSolved, TileGroupMap } from '../engine/puzzle';
import { useGameStore } from '../store/gameStore';
import { useProgressStore, computeStars } from '../store/progressStore';
import { Level, levelRequiresExactOrder, effectiveOptimalMoves } from '../data/levels';
import { useSettingsStore } from '../store/settingsStore';
import { useHints } from './useHints';
import { derivePatternTiles, buildTileGroupMap } from '../engine/patterns';

type PuzzleHookResult = {
  puzzleState: PuzzleState;
  moveCount: number;
  isWon: boolean;
  tileGroupMap: TileGroupMap | undefined;
  tryMove: (tileIndex: number) => boolean;
  restart: () => void;
  hints: ReturnType<typeof useHints>;
};

export function usePuzzle(level: Level, initialState: PuzzleState): PuzzleHookResult {
  const { updateState, clearGame } = useGameStore();
  const { recordCompletion } = useProgressStore();

  const [puzzleState, setPuzzleState] = useState<PuzzleState>(initialState);
  const [moveCount, setMoveCount] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const wonRef = useRef(false);

  const tileNumbersVisible = useSettingsStore((s) => s.tileNumbersVisible);
  const exactOrder = levelRequiresExactOrder(level, tileNumbersVisible);

  // When numbers are shown the tiles are distinguishable, so the puzzle is only
  // solved in exact numeric order — i.e. no color-group leniency. Dropping the
  // tileGroupMap makes isSolved fall back to the strict numeric goal.
  const tileGroupMap: TileGroupMap | undefined =
    !exactOrder && level.source.kind === 'pattern'
      ? buildTileGroupMap(derivePatternTiles(level.source.pattern, level.gridSize))
      : undefined;

  const hints = useHints(level.hintsAllowed);

  const tryMove = useCallback(
    (tileIndex: number): boolean => {
      if (wonRef.current) return false;
      if (!isValidMove(puzzleState, tileIndex)) return false;

      const next = applyMove(puzzleState, tileIndex);
      const newMoveCount = moveCount + 1;

      setPuzzleState(next);
      setMoveCount(newMoveCount);
      updateState(next, newMoveCount);
      hints.cancelHints();

      if (isSolved(next, tileGroupMap)) {
        wonRef.current = true;
        setIsWon(true);
      }

      return true;
    },
    [puzzleState, moveCount, tileGroupMap, hints, updateState],
  );

  const restart = useCallback(() => {
    setPuzzleState(initialState);
    setMoveCount(0);
    setIsWon(false);
    wonRef.current = false;
    hints.cancelHints();
    updateState(initialState, 0);
  }, [initialState, hints, updateState]);

  useEffect(() => {
    if (!isWon) return;
    const elapsedSeconds = useGameStore.getState().activeGame?.elapsedSeconds ?? 0;
    const hintsUsed = useGameStore.getState().activeGame?.hintsUsed ?? 0;
    const stars = computeStars(moveCount, effectiveOptimalMoves(level, tileNumbersVisible));
    recordCompletion({
      levelId: level.id,
      moves: moveCount,
      time: elapsedSeconds,
      stars,
      hintsUsed,
    });
    clearGame();
  }, [isWon, moveCount, level, tileNumbersVisible, recordCompletion, clearGame]);

  return { puzzleState, moveCount, isWon, tileGroupMap, tryMove, restart, hints };
}
