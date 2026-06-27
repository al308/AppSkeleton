import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

type Props = {
  stars: number;
  maxStars?: number;
  size?: number;
  starColor: string;
  emptyColor: string;
};

export function StarRating({
  stars,
  maxStars = 3,
  size = 20,
  starColor,
  emptyColor,
}: Props): React.ReactElement {
  return (
    <View style={styles.row} accessibilityLabel={`${stars} von ${maxStars} Sternen`}>
      {Array.from({ length: maxStars }, (_, i) => (
        <Text key={i} style={{ fontSize: size, color: i < stars ? starColor : emptyColor }}>
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});
