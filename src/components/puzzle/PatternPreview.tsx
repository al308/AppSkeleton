import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PatternDefinition, derivePatternTiles } from '../../engine/patterns';
import { TileGlyph } from './TileGlyph';

type Props = {
  pattern: PatternDefinition;
  gridSize: number;
  size: number;
  radius?: number;
};

// Renders the *solved* pattern as a grid of colored cells. Pattern levels have
// no image asset, so this is their visual preview (and can double as an
// in-game reference of the target arrangement).
export function PatternPreview({ pattern, gridSize, size, radius = 0 }: Props): React.ReactElement {
  // Solved order: tile N sits at position N-1, blank (0) last. The derived
  // tiles are already in solved order, so position == array index.
  const tiles = useMemo(() => derivePatternTiles(pattern, gridSize), [pattern, gridSize]);

  const cell = size / gridSize;
  const glyph = pattern.glyph;
  const showNumber = pattern.style === 'number';

  return (
    <View style={[styles.grid, { width: size, height: size, borderRadius: radius }]}>
      {tiles.map((tile, index) => (
        <View
          key={index}
          style={{ width: cell, height: cell, backgroundColor: tile.color, overflow: 'hidden' }}
        >
          {glyph && glyph !== 'none' && tile.tileId !== 0 && (
            <TileGlyph motif={glyph} size={cell} />
          )}
          {showNumber && tile.tileId !== 0 && (
            <View style={styles.numberCell}>
              <Text style={styles.numberText}>{tile.tileId}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  numberCell: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '800',
    fontSize: 11,
  },
});
