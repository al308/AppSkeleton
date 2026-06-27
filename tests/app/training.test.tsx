import { render, screen } from '@testing-library/react-native';
import TrainingScreen from '../../src/app/training/[lesson]';

const mockReplace = jest.fn();
const mockState = { lesson: 'basics-3x3' };

// babel-jest hoists jest.mock above the imports above, so the screen import already sees
// this mocked module.
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ lesson: mockState.lesson }),
}));

describe('TrainingScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockState.lesson = 'basics-3x3';
  });

  it('renders the first phase of the lesson with its teaching copy', () => {
    render(<TrainingScreen />);

    expect(screen.getByText('Obere Reihe')).toBeTruthy();
    expect(screen.getByText('Schritt 1/3')).toBeTruthy();
  });

  it('shows the move arrow over the tile to slide for the first expected move', () => {
    render(<TrainingScreen />);

    // The arrow always marks the next tile. (The ghost target only appears when that
    // tile is headed to a different square — see GhostTarget's own tests.)
    expect(screen.getByTestId('move-arrow', { includeHiddenElements: true })).toBeTruthy();
  });

  it('shows the lesson intro before the first move', () => {
    render(<TrainingScreen />);

    expect(screen.getByText(/Schiebepuzzles löst man nicht wild/)).toBeTruthy();
  });

  it('falls back gracefully for an unknown lesson id', () => {
    mockState.lesson = 'does-not-exist';

    render(<TrainingScreen />);

    expect(screen.getByText('Lektion nicht gefunden.')).toBeTruthy();
  });
});
