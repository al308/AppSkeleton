import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { World } from '../../data/worlds';
import { WorldProgress } from '../../store/selectors';
import { WorldCoverCard } from './WorldCoverCard';
import { Game, Spacing, Radii } from '../../constants/theme';

export type WorldEntry = {
  world: World;
  progress: WorldProgress;
  isUnlocked: boolean;
};

type Props = {
  entries: WorldEntry[];
  onSelect: (worldId: string) => void;
  reduceMotion: boolean;
};

const CARD_HEIGHT = 360;
const PEEK = Spacing.lg; // how much of the neighbour cards shows at the edges

export function WorldCarousel({ entries, onSelect, reduceMotion }: Props): React.ReactElement {
  const { width } = useWindowDimensions();
  const itemWidth = width - PEEK * 2;
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View style={styles.wrap}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: PEEK }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {entries.map((entry, index) => (
          <CarouselItem
            key={entry.world.id}
            entry={entry}
            index={index}
            itemWidth={itemWidth}
            scrollX={scrollX}
            reduceMotion={reduceMotion}
            onSelect={onSelect}
          />
        ))}
      </Animated.ScrollView>

      <Dots count={entries.length} itemWidth={itemWidth} scrollX={scrollX} />
    </View>
  );
}

type ItemProps = {
  entry: WorldEntry;
  index: number;
  itemWidth: number;
  scrollX: SharedValue<number>;
  reduceMotion: boolean;
  onSelect: (worldId: string) => void;
};

function CarouselItem({
  entry,
  index,
  itemWidth,
  scrollX,
  reduceMotion,
  onSelect,
}: ItemProps): React.ReactElement {
  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ scale: 1 }], opacity: 1 };
    const input = [(index - 1) * itemWidth, index * itemWidth, (index + 1) * itemWidth];
    const scale = interpolate(scrollX.value, input, [0.9, 1, 0.9], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, input, [0.5, 1, 0.5], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View style={[styles.item, { width: itemWidth }, animatedStyle]}>
      <WorldCoverCard
        world={entry.world}
        progress={entry.progress}
        isUnlocked={entry.isUnlocked}
        onPress={() => onSelect(entry.world.id)}
      />
    </Animated.View>
  );
}

function Dots({
  count,
  itemWidth,
  scrollX,
}: {
  count: number;
  itemWidth: number;
  scrollX: SharedValue<number>;
}): React.ReactElement {
  return (
    <View
      style={styles.dots}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} itemWidth={itemWidth} scrollX={scrollX} />
      ))}
    </View>
  );
}

function Dot({
  index,
  itemWidth,
  scrollX,
}: {
  index: number;
  itemWidth: number;
  scrollX: SharedValue<number>;
}): React.ReactElement {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * itemWidth, index * itemWidth, (index + 1) * itemWidth];
    const widthVal = interpolate(scrollX.value, input, [8, 22, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, input, [0.35, 1, 0.35], Extrapolation.CLAMP);
    return { width: widthVal, opacity };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  wrap: { height: CARD_HEIGHT + Spacing.xl },
  item: {
    height: CARD_HEIGHT,
    paddingHorizontal: Spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Game.accent,
  },
});
