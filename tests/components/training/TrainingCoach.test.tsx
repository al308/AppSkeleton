import { render, screen } from '@testing-library/react-native';
import { TrainingCoach } from '../../../src/components/training/TrainingCoach';
import { TrainingPhaseCopy } from '../../../src/data/training';

const phase: TrainingPhaseCopy = {
  kind: 'topRow',
  title: 'Obere Reihe',
  body: 'Setze zuerst die obere Reihe.',
};

describe('TrainingCoach', () => {
  it('shows the current phase title, body and progress while in progress', () => {
    render(
      <TrainingCoach
        phase={phase}
        phaseIndex={0}
        phaseCount={3}
        stepIndex={0}
        stepCount={10}
        isComplete={false}
        completionText="fertig"
      />,
    );

    expect(screen.getByText('Obere Reihe')).toBeTruthy();
    expect(screen.getByText('Setze zuerst die obere Reihe.')).toBeTruthy();
    expect(screen.getByText('Schritt 1/3')).toBeTruthy();
    expect(screen.getByText('Zug 1/10')).toBeTruthy();
  });

  it('shows the completion message when the lesson is done', () => {
    render(
      <TrainingCoach
        phase={null}
        phaseIndex={3}
        phaseCount={3}
        stepIndex={10}
        stepCount={10}
        isComplete
        completionText="Das ist das ganze Schema."
      />,
    );

    expect(screen.getByText('Geschafft!')).toBeTruthy();
    expect(screen.getByText('Das ist das ganze Schema.')).toBeTruthy();
  });
});
