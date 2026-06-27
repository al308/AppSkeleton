import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  LayoutChangeEvent,
  ImageSourcePropType,
} from 'react-native';
import { Level } from '../../data/levels';
import { resolveImageAsset } from '../../data/images';
import { PatternPreview } from '../puzzle/PatternPreview';
import { PuzzleRecord } from '../../store/progressStore';
import { Game, Radii, Typography } from '../../constants/theme';
import { StarRating } from './StarRating';

type Props = {
  level: Level;
  record?: PuzzleRecord | undefined;
  isUnlocked: boolean;
  isActive: boolean;
  index: number;
  onPress: () => void;
};

export function LevelCard({
  level,
  record,
  isUnlocked,
  isActive,
  index,
  onPress,
}: Props): React.ReactElement {
  const stars = record?.stars ?? 0;
  const [side, setSide] = useState(0);

  const thumb: ImageSourcePropType | undefined =
    level.source.kind === 'image' ? resolveImageAsset(level.source.asset) : undefined;

  const onLayout = (e: LayoutChangeEvent): void => {
    setSide(e.nativeEvent.layout.width);
  };

  return (
    <Pressable
      onLayout={onLayout}
      style={({ pressed }) => [
        styles.card,
        isActive && styles.active,
        pressed && isUnlocked && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!isUnlocked}
      accessibilityRole="button"
      accessibilityLabel={`Puzzle ${index + 1}: ${level.title}, ${level.gridSize}×${level.gridSize}`}
      accessibilityHint={
        isUnlocked
          ? record
            ? `Abgeschlossen mit ${stars} Sternen`
            : 'Noch nicht gespielt'
          : 'Gesperrt'
      }
      accessibilityState={{ disabled: !isUnlocked }}
    >
      {!isUnlocked ? (
        <View style={styles.lockedFill}>
          <Text style={styles.lockIcon} accessibilityElementsHidden>
            🔒
          </Text>
        </View>
      ) : (
        <>
          {level.source.kind === 'image' ? (
            <Image source={thumb} style={styles.fill} resizeMode="cover" />
          ) : (
            side > 0 && (
              <PatternPreview
                pattern={level.source.pattern}
                gridSize={level.gridSize}
                size={side}
              />
            )
          )}
          <View style={styles.scrim} />
          <Text style={styles.number}>{index + 1}</Text>
          <View style={styles.bottom}>
            <Text style={styles.grid}>
              {level.gridSize}×{level.gridSize}
            </Text>
            <StarRating stars={stars} size={11} starColor={Game.star} emptyColor={Game.starEmpty} />
          </View>
          {isActive && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>▶</Text>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: Game.surface,
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
    justifyContent: 'space-between',
  },
  active: { borderColor: Game.accent, borderWidth: 2 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  fill: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 6, 19, 0.28)',
  },
  lockedFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Game.tileBackground,
  },
  lockIcon: { fontSize: 22, opacity: 0.7 },
  number: {
    alignSelf: 'flex-start',
    margin: 6,
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 3,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  grid: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 3,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderBottomLeftRadius: Radii.md,
    backgroundColor: Game.accentDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#ffffff', fontSize: 9 },
});
