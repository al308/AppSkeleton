import { renderHook, act } from '@testing-library/react-native';
import { useTrainingSession, lessonSolutionMoves } from '../../src/hooks/useTrainingSession';
import { getTrainingLesson, TrainingLesson } from '../../src/data/training';
import { isSolved } from '../../src/engine/puzzle';

function lesson(id: string): TrainingLesson {
  const found = getTrainingLesson(id);
  if (!found) throw new Error(`missing test lesson ${id}`);
  return found;
}

describe('useTrainingSession', () => {
  it('starts on the first phase with an expected move and nothing complete', () => {
    const { result } = renderHook(() => useTrainingSession(lesson('basics-3x3')));

    expect(result.current.isComplete).toBe(false);
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.expectedMove).not.toBeNull();
    expect(result.current.currentPhase?.kind).toBe('topRow');
  });

  it('advances when the player makes the expected move', () => {
    const { result } = renderHook(() => useTrainingSession(lesson('basics-3x3')));
    const expected = result.current.expectedMove!;

    let accepted = false;
    act(() => {
      accepted = result.current.tryMove(expected.from);
    });

    expect(accepted).toBe(true);
    expect(result.current.stepIndex).toBe(1);
  });

  it('rejects a wrong move without changing state', () => {
    const { result } = renderHook(() => useTrainingSession(lesson('basics-3x3')));
    const expected = result.current.expectedMove!;
    const wrongTile = expected.from === 0 ? 1 : 0;
    const tilesBefore = result.current.puzzleState.tiles.join(',');

    let accepted = true;
    act(() => {
      accepted = result.current.tryMove(wrongTile);
    });

    expect(accepted).toBe(false);
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.puzzleState.tiles.join(',')).toBe(tilesBefore);
  });

  it('reaches completion and a solved board after the full solution sequence', () => {
    const trainingLesson = lesson('basics-3x3');
    const { result } = renderHook(() => useTrainingSession(trainingLesson));
    const solution = lessonSolutionMoves(trainingLesson);

    for (const move of solution) {
      act(() => {
        result.current.tryMove(move.from);
      });
    }

    expect(result.current.isComplete).toBe(true);
    expect(result.current.expectedMove).toBeNull();
    expect(isSolved(result.current.puzzleState)).toBe(true);
  });

  it('walks through every phase in order for the 4x4 lesson', () => {
    const trainingLesson = lesson('rowbyrow-4x4');
    const { result } = renderHook(() => useTrainingSession(trainingLesson));
    const solution = lessonSolutionMoves(trainingLesson);

    const seenPhases: string[] = [];
    for (const move of solution) {
      const kind = result.current.currentPhase?.kind;
      if (kind && seenPhases[seenPhases.length - 1] !== kind) seenPhases.push(kind);
      act(() => {
        result.current.tryMove(move.from);
      });
    }

    expect(seenPhases).toEqual(['topRow', 'secondRow', 'leftColumn', 'finalBlock']);
    expect(result.current.isComplete).toBe(true);
  });

  it('restart returns to the initial unsolved state', () => {
    const trainingLesson = lesson('basics-3x3');
    const { result } = renderHook(() => useTrainingSession(trainingLesson));
    const solution = lessonSolutionMoves(trainingLesson);

    for (const move of solution) {
      act(() => {
        result.current.tryMove(move.from);
      });
    }
    act(() => {
      result.current.restart();
    });

    expect(result.current.isComplete).toBe(false);
    expect(result.current.stepIndex).toBe(0);
    expect(isSolved(result.current.puzzleState)).toBe(false);
  });
});
