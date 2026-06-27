import { useWindowDimensions } from 'react-native';
import { computeBoardSize, computeTileSize } from '../constants/layout';

export type Orientation = 'portrait' | 'landscape';

type OrientationInfo = {
  orientation: Orientation;
  boardSize: number;
  tileSize: (gridSize: number) => number;
  screenWidth: number;
  screenHeight: number;
};

export function useOrientation(): OrientationInfo {
  const { width, height } = useWindowDimensions();
  const orientation: Orientation = width > height ? 'landscape' : 'portrait';
  const boardSize = computeBoardSize(width, height);

  return {
    orientation,
    boardSize,
    tileSize: (gridSize: number) => computeTileSize(boardSize, gridSize),
    screenWidth: width,
    screenHeight: height,
  };
}
