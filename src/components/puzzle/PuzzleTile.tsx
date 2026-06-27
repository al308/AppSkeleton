import React from 'react';
import { StyleSheet, View, Text, Image, ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { TILE_BORDER_RADIUS, TILE_GAP } from '../../constants/layout';
import { getTileOffset } from '../../engine/tileLayout';
import { GlyphMotif } from '../../engine/patterns';
import { TileGlyph } from './TileGlyph';

type Props = {
  tileId: number;
  positionIndex: number;
  gridSize: number;
  tileSize: number;
  imageSource?: ImageSourcePropType | undefined;
  patternColor?: string | undefined;
  glyph?: GlyphMotif | undefined;
  forceNumber?: boolean | undefined;
  showNumber: boolean;
  isHinted: boolean;
  hintStep?: number | undefined;
  animX: SharedValue<number>;
  animY: SharedValue<number>;
  textColor: string;
  accentColor: string;
};

export function PuzzleTile({
  tileId,
  positionIndex,
  gridSize,
  tileSize,
  imageSource,
  patternColor,
  glyph,
  forceNumber,
  showNumber,
  isHinted,
  hintStep,
  animX,
  animY,
  textColor,
  accentColor,
}: Props): React.ReactElement | null {
  const row = Math.floor(positionIndex / gridSize);
  const col = positionIndex % gridSize;
  const baseX = col * (tileSize + TILE_GAP);
  const baseY = row * (tileSize + TILE_GAP);

  // Hooks must precede any conditional return
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: baseX + animX.value }, { translateY: baseY + animY.value }],
  }));

  if (tileId === 0) return null;

  const { translateX: imgX, translateY: imgY } = getTileOffset(
    tileId,
    gridSize,
    tileSize + TILE_GAP,
  );

  const containerStyle = [
    styles.tile,
    {
      width: tileSize,
      height: tileSize,
      borderRadius: TILE_BORDER_RADIUS,
      borderWidth: isHinted ? 2.5 : 0,
      borderColor: isHinted ? accentColor : 'transparent',
      backgroundColor: patternColor ?? '#cccccc',
    },
    animStyle,
  ];

  return (
    <Animated.View style={containerStyle} accessible accessibilityLabel={`Kachel ${tileId}`}>
      {imageSource && (
        <Image
          source={imageSource}
          style={[
            styles.image,
            {
              width: tileSize * gridSize + TILE_GAP * (gridSize - 1),
              height: tileSize * gridSize + TILE_GAP * (gridSize - 1),
              transform: [{ translateX: imgX }, { translateY: imgY }],
            },
          ]}
          resizeMode="cover"
        />
      )}
      {glyph && glyph !== 'none' && <TileGlyph motif={glyph} size={tileSize} />}
      {forceNumber ? (
        <Text style={[styles.bigNumberText, { color: textColor }]}>{tileId}</Text>
      ) : (
        showNumber && (
          <View style={styles.numberBadge}>
            <Text style={[styles.numberText, { color: textColor }]}>{tileId}</Text>
          </View>
        )
      )}
      {isHinted && hintStep !== undefined && (
        <View style={[styles.hintBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.hintBadgeText}>{hintStep}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  numberBadge: {
    position: 'absolute',
    bottom: 3,
    right: 5,
    opacity: 0.6,
  },
  numberText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bigNumberText: {
    fontSize: 28,
    fontWeight: '800',
  },
  hintBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
