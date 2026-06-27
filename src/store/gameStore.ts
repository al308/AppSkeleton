import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PuzzleState } from '../engine/puzzle';

export type ActiveGame = {
  levelId: string;
  puzzleState: PuzzleState;
  moveCount: number;
  elapsedSeconds: number;
  hintsUsed: number;
  hintsAllowed: number;
  startedAt: string;
};

type GameStoreState = {
  activeGame: ActiveGame | null;
};

type GameStoreActions = {
  startGame: (params: { levelId: string; initialState: PuzzleState; hintsAllowed: number }) => void;
  updateState: (puzzleState: PuzzleState, moveCount: number) => void;
  tickTimer: (seconds: number) => void;
  useHint: () => void;
  clearGame: () => void;
};

export const useGameStore = create<GameStoreState & GameStoreActions>()(
  persist(
    (set) => ({
      activeGame: null,

      startGame: ({ levelId, initialState, hintsAllowed }) => {
        set({
          activeGame: {
            levelId,
            puzzleState: initialState,
            moveCount: 0,
            elapsedSeconds: 0,
            hintsUsed: 0,
            hintsAllowed,
            startedAt: new Date().toISOString(),
          },
        });
      },

      updateState: (puzzleState, moveCount) => {
        set((state) => {
          if (!state.activeGame) return state;
          return { activeGame: { ...state.activeGame, puzzleState, moveCount } };
        });
      },

      tickTimer: (seconds) => {
        set((state) => {
          if (!state.activeGame) return state;
          return {
            activeGame: {
              ...state.activeGame,
              elapsedSeconds: state.activeGame.elapsedSeconds + seconds,
            },
          };
        });
      },

      useHint: () => {
        set((state) => {
          if (!state.activeGame) return state;
          return {
            activeGame: {
              ...state.activeGame,
              hintsUsed: state.activeGame.hintsUsed + 1,
            },
          };
        });
      },

      clearGame: () => set({ activeGame: null }),
    }),
    {
      name: 'shiffle.activeGame',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
