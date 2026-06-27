import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GlyphMotif } from '../../engine/patterns';

type Props = {
  motif: GlyphMotif;
  size: number;
};

const LINE_COLOR = 'rgba(255,255,255,0.45)';
const LINE_COUNT = 4;

// Draws a simple line motif on top of a tile's background using plain Views.
// Kept dependency-free (no SVG): diagonals are full-width bars rotated 45°.
export function TileGlyph({ motif, size }: Props): React.ReactElement | null {
  if (motif === 'none') return null;

  const thickness = Math.max(1, Math.round(size * 0.04));
  const gap = size / (LINE_COUNT + 1);
  const lines: React.ReactElement[] = [];

  const horizontal = motif === 'lines_h' || motif === 'grid';
  const vertical = motif === 'lines_v' || motif === 'grid';

  if (horizontal) {
    for (let i = 1; i <= LINE_COUNT; i++) {
      lines.push(
        <View
          key={`h${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: gap * i - thickness / 2,
            height: thickness,
            backgroundColor: LINE_COLOR,
          }}
        />,
      );
    }
  }

  if (vertical) {
    for (let i = 1; i <= LINE_COUNT; i++) {
      lines.push(
        <View
          key={`v${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: gap * i - thickness / 2,
            width: thickness,
            backgroundColor: LINE_COLOR,
          }}
        />,
      );
    }
  }

  if (motif === 'lines_d' || motif === 'lines_d2') {
    const rotate = motif === 'lines_d' ? '45deg' : '-45deg';
    const span = size * 1.6;
    const spacing = span / (LINE_COUNT + 1);
    for (let i = 0; i <= LINE_COUNT; i++) {
      lines.push(
        <View
          key={`d${i}`}
          style={{
            position: 'absolute',
            top: spacing * i - span / 2 + size / 2,
            left: -size * 0.3,
            width: span,
            height: thickness,
            backgroundColor: LINE_COLOR,
            transform: [{ rotate }],
          }}
        />,
      );
    }
  }

  return (
    <View
      style={styles.overlay}
      pointerEvents="none"
      testID="tile-glyph"
      accessibilityElementsHidden
    >
      {lines}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
