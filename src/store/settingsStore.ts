import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ControlMode = 'tap' | 'swipe' | 'both';
export type ReferenceMode = 'pip' | 'side' | 'ghost' | 'off';
export type Theme = 'light' | 'dark' | 'auto';

type Settings = {
  hapticsEnabled: boolean;
  multiSlideEnabled: boolean;
  controlMode: ControlMode;
  referenceMode: ReferenceMode;
  timerVisible: boolean;
  moveCounterVisible: boolean;
  optimalMovesVisible: boolean;
  tileNumbersVisible: boolean;
  theme: Theme;
  coachmarkDismissed: boolean;
};

type SettingsActions = {
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
};

const DEFAULTS: Settings = {
  hapticsEnabled: true,
  multiSlideEnabled: false,
  controlMode: 'both',
  referenceMode: 'pip',
  timerVisible: true,
  moveCounterVisible: true,
  optimalMovesVisible: true,
  tileNumbersVisible: false,
  theme: 'auto',
  coachmarkDismissed: false,
};

export const useSettingsStore = create<Settings & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'shiffle.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
