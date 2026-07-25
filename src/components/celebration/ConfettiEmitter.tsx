import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Game } from '../../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 70;
const COLORS = [Game.accent, Game.accentDeep, Game.star, Game.success, Game.hintHighlight] as const;

type Particle = {
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  spinDuration: number;
  spinDirection: 1 | -1;
};

function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: randomBetween(0, SCREEN_W),
    y: randomBetween(-50, -10),
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? Game.accent,
    size: randomBetween(6, 14),
    delay: randomBetween(0, 600),
    duration: randomBetween(1200, 2000),
    spinDuration: randomBetween(500, 1000),
    spinDirection: Math.random() < 0.5 ? 1 : -1,
  }));
}

type ParticleViewProps = {
  particle: Particle;
};

function ParticleView({ particle }: ParticleViewProps): React.ReactElement {
  const translateY = useSharedValue(particle.y);
  const opacity = useSharedValue(1);
  const spin = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withTiming(SCREEN_H + 50, { duration: particle.duration, easing: Easing.in(Easing.cubic) }),
    );
    opacity.value = withDelay(
      particle.delay + particle.duration * 0.7,
      withTiming(0, { duration: particle.duration * 0.3 }),
    );
    spin.value = withRepeat(
      withTiming(particle.spinDirection * 360, {
        duration: particle.spinDuration,
        easing: Easing.linear,
      }),
      -1,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${spin.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      testID="confetti-particle"
      style={[
        styles.particle,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size * 0.6,
          backgroundColor: particle.color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

type Props = {
  onFinished?: () => void;
};

export function ConfettiEmitter({ onFinished }: Props): React.ReactElement {
  const particles = React.useMemo(generateParticles, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <ParticleView key={i} particle={p} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
  },
});
