import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { ImageGridItem } from '../components/ImageGridItem';
import { ImageType } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { addFavorite, removeFavorite, isFavorite } from '../utils/storage';
import { useImageList } from '../hooks/useImageList';

const FavoritesScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [favoriteImages, setFavoriteImages] = useState<ImageType[]>([]);
  const { images } = useImageList();

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteIds = await AsyncStorage.getItem('favorites');
      const favoriteIdsArray = favoriteIds ? JSON.parse(favoriteIds) : [];
      const favImages = images
        .filter(img => favoriteIdsArray.includes(img.id))
        .map(img => ({
          ...img,
          author: img.collaborator_name || '',
          tags: img.note ? [img.note] : [],
          views: Math.floor(Math.random() * 1000),
        }));
      console.log('Loaded favorite images:', favImages.length, 'IDs:', favoriteIdsArray);
      setFavoriteImages(favImages);
    };
    loadFavorites();
  }, [images]);

  const toggleFavorite = async (imageId: number) => {
    const isFav = await isFavorite(imageId);
    console.log(`Toggling favorite for image ${imageId}: ${isFav ? 'Removing' : 'Adding'}`);
    if (isFav) {
      await removeFavorite(imageId);
    } else {
      await addFavorite(imageId);
    }
    const favoriteIds = await AsyncStorage.getItem('favorites');
    const favoriteIdsArray = favoriteIds ? JSON.parse(favoriteIds) : [];
    const favImages = images
      .filter(img => favoriteIdsArray.includes(img.id))
      .map(img => ({
        ...img,
        author: img.collaborator_name || '',
        tags: img.note ? [img.note] : [],
        views: Math.floor(Math.random() * 1000),
      }));
    console.log('Updated favorite images:', favImages.length, 'IDs:', favoriteIdsArray);
    setFavoriteImages(favImages);
  };

  const renderItem = ({ item }: { item: ImageType }) => {
    const selectedIndex = favoriteImages.findIndex((img) => img.id === item.id);
    return (
      <ImageGridItem
        image={item}
        onPress={() => {
          console.log('Navigating to ImageViewerScreen from Favorites with image ID:', item.id, 'Index:', selectedIndex);
          navigation.navigate('ImageViewerScreen', {
            images: favoriteImages,
            selectedIndex,
          });
        }}
        isFavorite={true}
        onFavoriteToggle={() => toggleFavorite(item.id)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Favorites</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            console.log('Navigating back from FavoritesScreen');
            navigation.goBack();
          }}
        >
          <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
      </View>
      <FlashList
        data={favoriteImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={150}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.text, textAlign: 'center', fontSize: 16 }}>
              No favorite images yet. Add some from the Home screen!
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default FavoritesScreen;