import { PuzzleState } from '../engine/puzzle';
import { TrainingPhaseKind } from '../engine/trainingPlan';

// The training lessons are fully fixed: each ships an explicit starting arrangement
// rather than a shuffle seed. The lesson *is* the row-by-row schema applied to a known
// short scramble, so we want byte-for-byte determinism independent of shuffle internals.
// Both arrangements were chosen offline so their staged (row-by-row) solution is short,
// solvable, and exercises every phase — see tests/data/training.test.ts.

export type TrainingPhaseCopy = {
  kind: TrainingPhaseKind;
  title: string;
  // Shown while the player works through this phase. Describes the *objective*, since a
  // single phase moves several tiles, only some of which are the ones being placed.
  body: string;
};

export type TrainingLesson = {
  id: string;
  title: string;
  subtitle: string;
  gridSize: 3 | 4;
  // Flat tile arrangement, index = position, value = tileId (0 = blank).
  startTiles: number[];
  // The teaching narrative per phase, in lesson order. Phase kinds must match the plan
  // that buildTrainingPlan derives for this grid size.
  phaseCopy: TrainingPhaseCopy[];
  // One-line intro shown before the first move.
  intro: string;
  // Shown on the completion card.
  outro: string;
};

function stateOf(tiles: number[], size: 3 | 4): PuzzleState {
  return { tiles, size, blankIndex: tiles.indexOf(0) };
}

const LESSON_A: TrainingLesson = {
  id: 'basics-3x3',
  title: 'Das Schema',
  subtitle: '3×3 · 10 Züge',
  gridSize: 3,
  startTiles: [5, 1, 3, 4, 2, 6, 7, 8, 0],
  intro:
    'Schiebepuzzles löst man nicht wild, sondern nach Schema: erst die obere Reihe, dann die linke Spalte, zuletzt der kleine Rest. Folge dem Pfeil.',
  phaseCopy: [
    {
      kind: 'topRow',
      title: 'Obere Reihe',
      body: 'Wir setzen zuerst die ganze obere Reihe (1, 2, 3). Manche Kacheln müssen dafür kurz Platz machen — folge einfach dem Pfeil.',
    },
    {
      kind: 'leftColumn',
      title: 'Linke Spalte',
      body: 'Jetzt die linke Spalte (4, 7). Damit ist eine Reihe und eine Spalte fest — das Problem ist auf ein kleines Feld geschrumpft.',
    },
    {
      kind: 'finalBlock',
      title: 'Letzter Block',
      body: 'Der Rest wird nur noch im Kreis gedreht, bis alles sitzt. Geschafft!',
    },
  ],
  outro:
    'Das ist das ganze Schema: Reihe → Spalte → Rest. Auf größeren Feldern wiederholst du es einfach.',
};

const LESSON_B: TrainingLesson = {
  id: 'rowbyrow-4x4',
  title: 'Reihe für Reihe',
  subtitle: '4×4 · 14 Züge',
  gridSize: 4,
  startTiles: [0, 1, 2, 3, 5, 7, 8, 4, 10, 6, 15, 11, 9, 13, 14, 12],
  intro:
    'Auf dem 4×4 wiederholst du dasselbe Schema von oben nach unten: Reihe 1, Reihe 2, dann die linke Spalte des Rests, zuletzt der Block unten rechts.',
  phaseCopy: [
    {
      kind: 'topRow',
      title: 'Reihe 1',
      body: 'Setze die erste Reihe (1–4). Sobald sie steht, fasst du sie nicht mehr an.',
    },
    {
      kind: 'secondRow',
      title: 'Reihe 2',
      body: 'Dann die zweite Reihe (5–8). Jetzt sind die oberen zwei Reihen fertig.',
    },
    {
      kind: 'leftColumn',
      title: 'Linke Spalte',
      body: 'Sichere die linke Spalte des Rests (9, 13). Übrig bleibt ein kleines Feld unten rechts.',
    },
    {
      kind: 'finalBlock',
      title: 'Letzter Block',
      body: 'Den kleinen Rest drehst du im Kreis fertig. Fertig ist das 4×4!',
    },
  ],
  outro:
    'Genau so löst du jedes Schiebepuzzle: immer Reihe für Reihe, dann Spalte für Spalte, bis nur ein winziger Block bleibt.',
};

export const TRAINING_LESSONS: TrainingLesson[] = [LESSON_A, LESSON_B];

export function getTrainingLesson(id: string): TrainingLesson | undefined {
  return TRAINING_LESSONS.find((lesson) => lesson.id === id);
}

export function trainingStartState(lesson: TrainingLesson): PuzzleState {
  return stateOf([...lesson.startTiles], lesson.gridSize);
}
