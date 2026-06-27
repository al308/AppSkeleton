import { render, screen, fireEvent } from '@testing-library/react-native';
import TitleRoute from '../../src/app/index';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('Title screen', () => {
  beforeEach(() => mockPush.mockClear());

  it('shows the brand title and primary actions', () => {
    render(<TitleRoute />);

    expect(screen.getAllByText('SHIFFLE').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Spielen/)).toBeTruthy();
    expect(screen.getByLabelText(/Einstellungen/)).toBeTruthy();
  });

  it('navigates into the worlds carousel when Play is tapped', () => {
    render(<TitleRoute />);

    fireEvent.press(screen.getByLabelText(/Spielen/));

    expect(mockPush).toHaveBeenCalledWith('/worlds');
  });
});
