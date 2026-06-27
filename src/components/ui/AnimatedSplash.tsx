import { useEffect } from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Game } from '../../constants/theme';

const logoImage = require('../../../assets/icon.png');

const INTRO_MS = 700;
const HOLD_MS = 1400;
const OUTRO_MS = 450;

type Props = {
  onFinish: () => void;
  reduceMotion?: boolean;
};

// Branded launch animation shown once per app session: the puzzle-grid logo
// fades and springs in, gently floats, the wordmark follows, then the whole
// overlay fades to reveal the title screen. Mirrors the family pattern
// (HarborChaos AnimatedSplash). Respects reduce-motion by skipping the
// movement and finishing quickly.
export function AnimatedSplash({ onFinish, reduceMotion = false }: Props): React.ReactElement {
  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const logoScale = useSharedValue(reduceMotion ? 1 : 0.82);
  const float = useSharedValue(0);
  const wordOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      containerOpacity.value = withDelay(
        HOLD_MS,
        withTiming(0, { duration: OUTRO_MS }, (finished) => {
          if (finished) runOnJS(onFinish)();
        }),
      );
      return;
    }

    logoOpacity.value = withTiming(1, { duration: INTRO_MS });
    logoScale.value = withTiming(1, {
      duration: INTRO_MS,
      easing: Easing.out(Easing.back(1.4)),
    });
    wordOpacity.value = withDelay(INTRO_MS * 0.6, withTiming(1, { duration: INTRO_MS }));

    float.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    containerOpacity.value = withDelay(
      HOLD_MS,
      withTiming(0, { duration: OUTRO_MS, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [containerOpacity, float, logoOpacity, logoScale, wordOpacity, onFinish, reduceMotion]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: float.value }, { scale: logoScale.value }],
  }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: wordOpacity.value }));

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      <Animated.View style={logoStyle}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={wordStyle}>
        <Text style={styles.title}>SHIFFLE</Text>
        <Text style={styles.tagline}>Slide. Solve. Relax.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: Game.bgSolid,
    zIndex: 10,
  },
  logo: {
    width: 132,
    height: 132,
    borderRadius: 28,
  },
  title: {
    color: Game.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
  },
  tagline: {
    color: Game.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 6,
  },
});
