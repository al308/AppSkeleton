import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Level } from '../../data/levels';
import { resolveImageAsset } from '../../data/images';
import { ReferenceMode } from '../../store/settingsStore';
import { PatternPreview } from './PatternPreview';
import { Game, Typography, Radii } from '../../constants/theme';

type Props = {
  level: Level;
  mode: ReferenceMode;
  boardSize: number;
  // Upper bound for the "side" thumbnail; lets a roomy landscape flank show a
  // larger reference than a cramped portrait stack. Defaults to the compact size.
  sideMax?: number;
};

const PIP_FRACTION = 0.28;
const PIP_MIN = 72;
const SIDE_FRACTION = 0.42;
const SIDE_MAX_DEFAULT = 160;

// Shows the *target* image/pattern so the player can see what they are
// assembling toward. Placement depends on `mode`:
//  - pip   → small framed thumbnail pinned to the board's top-right corner
//  - ghost → faint full-board overlay sitting under the tiles
//  - side  → a labelled block rendered inline next to the board (caller places it)
//  - off   → nothing
export function SolutionReference({
  level,
  mode,
  boardSize,
  sideMax = SIDE_MAX_DEFAULT,
}: Props): React.ReactElement | null {
  if (mode === 'off') return null;

  const size =
    mode === 'pip'
      ? Math.max(boardSize * PIP_FRACTION, PIP_MIN)
      : mode === 'side'
        ? Math.min(boardSize * SIDE_FRACTION, sideMax)
        : boardSize;

  const content =
    level.source.kind === 'image' ? (
      <Image
        source={resolveImageAsset(level.source.asset)}
        style={{ width: size, height: size, borderRadius: mode === 'ghost' ? 0 : Radii.sm }}
        resizeMode="cover"
      />
    ) : (
      <PatternPreview
        pattern={level.source.pattern}
        gridSize={level.gridSize}
        size={size}
        radius={mode === 'ghost' ? 0 : Radii.sm}
      />
    );

  if (mode === 'ghost') {
    return (
      <View style={styles.ghost} pointerEvents="none" accessibilityElementsHidden>
        {content}
      </View>
    );
  }

  if (mode === 'pip') {
    return (
      <View style={[styles.pip, { width: size, height: size }]} pointerEvents="none">
        {content}
        <View style={styles.pipLabel}>
          <Text style={styles.pipLabelText}>Ziel</Text>
        </View>
      </View>
    );
  }

  // side
  return (
    <View style={styles.side}>
      <Text style={styles.sideLabel}>Ziel</Text>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  ghost: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pip: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: Radii.sm + 2,
    borderWidth: 2,
    borderColor: Game.surfaceBorder,
    backgroundColor: Game.bgSolid,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  pipLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7,6,19,0.6)',
    paddingVertical: 1,
    alignItems: 'center',
  },
  pipLabelText: {
    ...Typography.caption,
    fontSize: 9,
    color: Game.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  side: {
    alignItems: 'center',
    gap: 6,
  },
  sideLabel: {
    ...Typography.caption,
    color: Game.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
