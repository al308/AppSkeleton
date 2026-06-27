import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

type TimerOptions = {
  isRunning: boolean;
  onTick: (elapsedSeconds: number) => void;
};

export function useTimer({ isRunning, onTick }: TimerOptions): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        backgroundedAtRef.current = Date.now();
      } else if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        if (backgroundedAtRef.current !== null) {
          const elapsed = Math.floor((Date.now() - backgroundedAtRef.current) / 1000);
          if (isRunning && elapsed > 0) {
            onTick(elapsed);
          }
          backgroundedAtRef.current = null;
        }
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, [isRunning, onTick]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      onTick(1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onTick]);
}
