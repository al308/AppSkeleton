import { render, screen, fireEvent } from '@testing-library/react-native';
import WorldsScreen from '../../src/app/worlds';
import { WORLDS } from '../../src/data/worlds';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: mockBack }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('Worlds carousel screen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it('renders one card per world', () => {
    render(<WorldsScreen />);

    for (const world of WORLDS) {
      expect(screen.getByText(world.title)).toBeTruthy();
    }
  });

  it('navigates to a world when its card is tapped', () => {
    render(<WorldsScreen />);

    fireEvent.press(screen.getByLabelText(/Welt Natur/));

    expect(mockPush).toHaveBeenCalledWith('/world/natur');
  });

  it('goes back to the title screen via the back button', () => {
    render(<WorldsScreen />);

    fireEvent.press(screen.getByLabelText('Zurück'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
