import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ConfettiEmitter } from '../../../src/components/celebration/ConfettiEmitter';
import { Game } from '../../../src/constants/theme';

const THEME_COLORS = new Set<string>([
  Game.accent,
  Game.accentDeep,
  Game.star,
  Game.success,
  Game.hintHighlight,
]);

function flattenStyle(style: unknown): Record<string, unknown> {
  return Object.assign({}, ...(Array.isArray(style) ? style.flat(Infinity) : [style]));
}

describe('ConfettiEmitter', () => {
  it('renders a burst of particles, all colored from the game palette', () => {
    render(<ConfettiEmitter />);

    const particles = screen.getAllByTestId('confetti-particle');
    expect(particles.length).toBeGreaterThan(0);

    for (const particle of particles) {
      const { backgroundColor } = flattenStyle(particle.props.style);
      expect(THEME_COLORS.has(String(backgroundColor))).toBe(true);
    }
  });

  it('schedules onFinished to fire once the burst lifetime elapses', () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const onFinished = jest.fn();

    render(<ConfettiEmitter onFinished={onFinished} />);

    const call = setTimeoutSpy.mock.calls.find(([, delay]) => delay === 2200);
    expect(call).toBeDefined();

    const scheduledCallback = call?.[0] as (() => void) | undefined;
    scheduledCallback?.();
    expect(onFinished).toHaveBeenCalledTimes(1);

    setTimeoutSpy.mockRestore();
  });
});
