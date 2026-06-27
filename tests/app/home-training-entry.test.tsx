import { render, screen, fireEvent } from '@testing-library/react-native';
import TitleRoute from '../../src/app/index';

const mockPush = jest.fn();

// babel-jest hoists these mocks above the imports above.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

// The title screen pulls in the persisted progress store, which reaches for native
// AsyncStorage. Swap in the library's official in-memory jest mock so the store hydrates.
// The factory runs hoisted, before imports, so it must require() rather than reference
// an imported binding.
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('Title screen training entry', () => {
  beforeEach(() => mockPush.mockClear());

  it('shows a Training entry on the title screen', () => {
    render(<TitleRoute />);

    expect(screen.getByText('Training')).toBeTruthy();
  });

  it('navigates into the first training lesson when tapped', () => {
    render(<TitleRoute />);

    fireEvent.press(screen.getByLabelText(/Training starten/));

    expect(mockPush).toHaveBeenCalledWith('/training/basics-3x3');
  });
});
