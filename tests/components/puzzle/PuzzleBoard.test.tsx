import { Gesture } from 'react-native-gesture-handler';
import { selectGesture } from '../../../src/components/puzzle/PuzzleBoard';

describe('selectGesture — control mode', () => {
  it('enables only the tap gesture in tap mode', () => {
    const tap = Gesture.Tap();
    const pan = Gesture.Pan();

    expect(selectGesture('tap', tap, pan)).toBe(tap);
  });

  it('enables only the pan gesture in swipe mode', () => {
    const tap = Gesture.Tap();
    const pan = Gesture.Pan();

    expect(selectGesture('swipe', tap, pan)).toBe(pan);
  });

  it('races both gestures in both mode', () => {
    const tap = Gesture.Tap();
    const pan = Gesture.Pan();

    const composed = selectGesture('both', tap, pan);

    expect(composed).not.toBe(tap);
    expect(composed).not.toBe(pan);
    expect(composed.constructor.name).toBe('ComposedGesture');
  });
});
