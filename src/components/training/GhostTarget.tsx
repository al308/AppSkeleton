import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { PuzzleState } from '../../engine/puzzle';
import { getTilePosition } from '../../engine/tileLayout';
import { TILE_BORDER_RADIUS } from '../../constants/layout';
import { Game } from '../../constants/theme';

type Props = {
  puzzleState: PuzzleState;
  // Position index of the tile the player is about to move.
  movingFrom: number;
  tileSize: number;
  gap: number;
  showNumber: boolean;
};

// The goal position of a numbered tile is fixed: tile N belongs at index N-1.
function goalPositionOf(tileId: number, total: number): number {
  return tileId === 0 ? total - 1 : tileId - 1;
}

// A faint dashed outline at the home square of the tile being moved, so the learner sees
// not just *which* tile moves but *where it is headed*. Purely decorative — never
// intercepts touches and is hidden from assistive tech.
export function GhostTarget({
  puzzleState,
  movingFrom,
  tileSize,
  gap,
  showNumber,
}: Props): React.ReactElement | null {
  const { tiles, size } = puzzleState;
  const tileId = tiles[movingFrom];
  if (tileId === undefined || tileId === 0) return null;

  const goalPos = goalPositionOf(tileId, size * size);
  // No point ghosting a tile already at home, or onto the square it currently occupies.
  if (goalPos === movingFrom) return null;

  const { x, y } = getTilePosition(goalPos, size, tileSize, gap);

  return (
    <View
      testID="ghost-target"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[
        styles.ghost,
        { left: x, top: y, width: tileSize, height: tileSize, borderRadius: TILE_BORDER_RADIUS },
      ]}
    >
      {showNumber ? <Text style={styles.label}>{tileId}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ghost: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Game.hintHighlight,
    backgroundColor: 'rgba(255, 179, 71, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Game.hintHighlight,
    fontSize: 18,
    fontWeight: '700',
    opacity: 0.7,
  },
});
