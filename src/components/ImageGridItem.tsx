
import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { ImageType } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface ImageGridItemProps {
  image: ImageType;
  onPress: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

export const ImageGridItem: React.FC<ImageGridItemProps> = ({
  image,
  onPress,
  isFavorite,
  onFavoriteToggle,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
    >
      <Image
        source={{ uri: image.thumbnail_url }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <TouchableOpacity
        onPress={onFavoriteToggle}
        style={styles.favoriteButton}
      >
        <Text style={{ color: isFavorite ? colors.primary : colors.text, fontSize: 24 }}>
          {isFavorite ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
});
