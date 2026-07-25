import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WinFlash } from '../../../src/components/celebration/WinFlash';

describe('WinFlash', () => {
  it('renders a full-screen accent overlay', () => {
    render(<WinFlash />);

    expect(screen.getByTestId('win-flash')).toBeTruthy();
  });
});
