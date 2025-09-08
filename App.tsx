
import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ImageViewerScreenWrapper from './src/screens/ImageViewerScreenWrapper';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ImageType } from './src/services/api';

const Stack = createStackNavigator();

const linking: LinkingOptions<{ Home: undefined; ImageViewerScreen: { images: ImageType[], selectedIndex: number }; Favorites: undefined; Settings: undefined }> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Home: 'home',
      ImageViewerScreen: 'event/:eventId/image/:id',
      Favorites: 'favorites',
      Settings: 'settings',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) {
      console.log('Initial URL:', url);
      const { path } = Linking.parse(url);
      if (path?.includes('event') && path.includes('image')) {
        const [, , eventId, , imageId] = path.split('/');
        return { eventId, imageId };
      }
    }
    return url;
  },
};

export default function App() {
  return (
    <ThemeProvider>
      <PaperProvider>
        <NavigationContainer linking={linking}>
          <Stack.Navigator id="mainStack" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ImageViewerScreen" component={ImageViewerScreenWrapper} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
}
