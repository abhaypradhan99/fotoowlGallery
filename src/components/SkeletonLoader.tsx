
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const SkeletonLoader: React.FC<{ count?: number }> = ({ count = 4 }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.item, { backgroundColor: colors.surface }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  item: {
    width: 150,
    height: 150,
    margin: 4,
    borderRadius: 8,
  },
});
