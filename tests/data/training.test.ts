import {
  TRAINING_LESSONS,
  getTrainingLesson,
  trainingStartState,
  TrainingLesson,
} from '../../src/data/training';
import { buildTrainingPlan, planSolves } from '../../src/engine/trainingPlan';
import { isSolvable } from '../../src/engine/solvability';
import { isSolved } from '../../src/engine/puzzle';

const MAX_TEACHING_MOVES = 16;

describe('training lessons', () => {
  it('ships exactly the two planned lessons (3x3 then 4x4)', () => {
    expect(TRAINING_LESSONS.map((l) => l.gridSize)).toEqual([3, 4]);
  });

  it('looks lessons up by id and rejects unknown ids', () => {
    expect(getTrainingLesson('basics-3x3')?.gridSize).toBe(3);
    expect(getTrainingLesson('nope')).toBeUndefined();
  });

  describe.each(TRAINING_LESSONS)('lesson "$id"', (lesson: TrainingLesson) => {
    const start = trainingStartState(lesson);

    it('has a start arrangement of the right length that is not already solved', () => {
      expect(start.tiles).toHaveLength(lesson.gridSize * lesson.gridSize);
      expect(isSolved(start)).toBe(false);
    });

    it('uses a solvable start arrangement', () => {
      expect(isSolvable(start)).toBe(true);
    });

    it('is solvable by the row-by-row schema', () => {
      const plan = buildTrainingPlan(start);
      expect(planSolves(start, plan)).toBe(true);
    });

    it('stays short enough to teach in one short sitting', () => {
      const plan = buildTrainingPlan(start);
      expect(plan.totalMoves).toBeLessThanOrEqual(MAX_TEACHING_MOVES);
    });

    it('has a copy entry for every phase the plan produces, in order', () => {
      const plan = buildTrainingPlan(start);
      expect(lesson.phaseCopy.map((c) => c.kind)).toEqual(plan.phases.map((p) => p.kind));
    });

    it('uses no emoji in player-facing copy (store/style guideline)', () => {
      const text = [
        lesson.intro,
        lesson.outro,
        ...lesson.phaseCopy.flatMap((c) => [c.title, c.body]),
      ].join(' ');
      // Matches common emoji ranges; the codebase keeps UI copy emoji-free.
      expect(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text)).toBe(false);
    });
  });

  it('caps the 3x3 lesson at 10 moves so it demonstrates the full schema briefly', () => {
    const lessonA = getTrainingLesson('basics-3x3');
    expect(lessonA).toBeDefined();
    const plan = buildTrainingPlan(trainingStartState(lessonA as TrainingLesson));
    expect(plan.totalMoves).toBeLessThanOrEqual(10);
  });
});
