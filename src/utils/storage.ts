
import AsyncStorage from '@react-native-async-storage/async-storage';

export const addFavorite = async (imageId: number) => {
  const favorites = await AsyncStorage.getItem('favorites');
  const favoriteArray = favorites ? JSON.parse(favorites) : [];
  if (!favoriteArray.includes(imageId)) {
    favoriteArray.push(imageId);
    await AsyncStorage.setItem('favorites', JSON.stringify(favoriteArray));
    console.log('Added favorite:', imageId);
  }
};

export const removeFavorite = async (imageId: number) => {
  const favorites = await AsyncStorage.getItem('favorites');
  const favoriteArray = favorites ? JSON.parse(favorites) : [];
  const updatedFavorites = favoriteArray.filter((id: number) => id !== imageId);
  await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  console.log('Removed favorite:', imageId);
};

export const isFavorite = async (imageId: number) => {
  const favorites = await AsyncStorage.getItem('favorites');
  const favoriteArray = favorites ? JSON.parse(favorites) : [];
  return favoriteArray.includes(imageId);
};
