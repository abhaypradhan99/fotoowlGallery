import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, RefreshControl, Text, TouchableOpacity, TextInput, SafeAreaView, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useImageList } from '../hooks/useImageList';
import { ImageGridItem } from '../components/ImageGridItem';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ImageType } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { addFavorite, removeFavorite, isFavorite } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { images, loading, error, hasMore, refresh, loadMore } = useImageList();
  const [favorites, setFavorites] = useState<number[]>([]);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [isOffline, setIsOffline] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Use useRef for Animated.Value

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state changed:', state.isConnected ? 'Online' : 'Offline');
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteImages = await AsyncStorage.getItem('favorites');
      console.log('Loaded favorites:', favoriteImages);
      setFavorites(favoriteImages ? JSON.parse(favoriteImages) : []);
    };
    loadFavorites();
  }, []);

  const toggleSortOptions = () => {
    const newShowSortOptions = !showSortOptions;
    setShowSortOptions(newShowSortOptions);
    Animated.timing(fadeAnim, {
      toValue: newShowSortOptions ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const selectSort = (option: 'newest' | 'oldest' | 'popular') => {
    setSortBy(option);
    setShowSortOptions(false);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const toggleFavorite = async (imageId: number) => {
    const isFav = await isFavorite(imageId);
    console.log(`Toggling favorite for image ${imageId}: ${isFav ? 'Removing' : 'Adding'}`);
    if (isFav) {
      await removeFavorite(imageId);
    } else {
      await addFavorite(imageId);
    }
    setFavorites(await AsyncStorage.getItem('favorites') ? JSON.parse(await AsyncStorage.getItem('favorites')!) : []);
  };

  const filteredImages = images.map(img => ({
    ...img,
    author: img.collaborator_name || '',
    tags: img.note ? [img.note] : [],
    views: Math.floor(Math.random() * 1000),
  })).filter(image =>
    (image.caption?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (image.author?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    image.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
    if (sortBy === 'oldest') return new Date(a.create_time).getTime() - new Date(b.create_time).getTime();
    if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
    return 0;
  });

  const renderItem = ({ item }: { item: ImageType }) => {
    const selectedIndex = images.findIndex((img) => img.id === item.id);
    return (
      <ImageGridItem
        image={item}
        onPress={() => {
          console.log('Navigating to ImageViewerScreen with image ID:', item.id, 'Index:', selectedIndex);
          navigation.navigate('ImageViewerScreen', {
            images,
            selectedIndex,
          });
        }}
        isFavorite={favorites.includes(item.id)}
        onFavoriteToggle={() => toggleFavorite(item.id)}
      />
    );
  };

  const getItemLayout = (_data: any, index: number) => ({
    length: 158,
    offset: 158 * index,
    index,
  });

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest': return '🆕 Newest';
      case 'oldest': return '📅 Oldest';
      case 'popular': return '🔥 Popular';
      default: return 'Sort';
    }
  };

  if (error && images.length === 0 && !isOffline) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>😔 {error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={refresh}>
            <Text style={[styles.retryButtonText, { color: colors.background }]}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
        {/* Bottom Navigation */}
        <View style={[styles.bottomNavigation, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.navItem, styles.navItemGradient]}
            onPress={() => {
              console.log('Navigating to FavoritesScreen');
              navigation.navigate('Favorites');
            }}
          >
            <Text style={styles.navIcon}>❤️</Text>
            <Text style={[styles.navText, { color: colors.text }]}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, styles.navItemGradient]}
            onPress={() => {
              console.log('Navigating to SettingsScreen');
              navigation.navigate('Settings');
            }}
          >
            <Text style={styles.navIcon}>⚙️</Text>
            <Text style={[styles.navText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {isOffline && (
        <Animated.View style={[styles.offlineIndicator, { backgroundColor: '#FF6B6B' }]}>
          <Text style={styles.offlineText}>📡 Offline Mode</Text>
        </Animated.View>
      )}
      
      {/* Header with gradient */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>✨ Gallery</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          {/* Modern Search Input */}
          <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search images, authors, tags..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Modern Sort Selector */}
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[styles.sortButton, { backgroundColor: colors.surface }]}
              onPress={toggleSortOptions}
            >
              <Text style={[styles.sortButtonText, { color: colors.text }]}>{getSortLabel()}</Text>
              <Text style={[styles.sortArrow, { color: colors.text }]}>
                {showSortOptions ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            
            {showSortOptions && (
              <>
                <TouchableWithoutFeedback onPress={toggleSortOptions}>
                  <View style={styles.sortOverlay} />
                </TouchableWithoutFeedback>
                <Animated.View 
                  style={[
                    styles.sortOptions,
                    {
                      backgroundColor: colors.surface,
                      opacity: fadeAnim,
                      top: 60, // Adjusted to position below the sort button
                      zIndex: 1001,
                    }
                  ]}
                >
                  <TouchableOpacity 
                    style={[styles.sortOption, sortBy === 'newest' && { backgroundColor: colors.primary + '20' }]}
                    onPress={() => selectSort('newest')}
                  >
                    <Text style={[styles.sortOptionText, { color: colors.text }]}>🆕 Newest</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.sortOption, sortBy === 'oldest' && { backgroundColor: colors.primary + '20' }]}
                    onPress={() => selectSort('oldest')}
                  >
                    <Text style={[styles.sortOptionText, { color: colors.text }]}>📅 Oldest</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.sortOption, sortBy === 'popular' && { backgroundColor: colors.primary + '20' }]}
                    onPress={() => selectSort('popular')}
                  >
                    <Text style={[styles.sortOptionText, { color: colors.text }]}>🔥 Popular</Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>
        </View>
        
        <FlashList
          data={sortedImages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={150}
          onEndReached={isOffline ? undefined : loadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={
            loading ? (
              <SkeletonLoader count={8} />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🖼️</Text>
                <Text style={[styles.emptyText, { color: colors.text }]}>No images found</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Try adjusting your search or filters</Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          removeClippedSubviews
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Modern Bottom Navigation */}
      <View style={[styles.bottomNavigation, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.navItem, styles.modernNavItem]}
          onPress={() => {
            console.log('Navigating to FavoritesScreen');
            navigation.navigate('Favorites');
          }}
        >
          <View style={[styles.navIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.navIcon}>❤️</Text>
          </View>
          <Text style={[styles.navText, { color: colors.text }]}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, styles.modernNavItem]}
          onPress={() => {
            console.log('Navigating to SettingsScreen');
            navigation.navigate('Settings');
          }}
        >
          <View style={[styles.navIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.navIcon}>⚙️</Text>
          </View>
          <Text style={[styles.navText, { color: colors.text }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  sortContainer: {
    marginBottom: 10,
    zIndex: 1000, // Ensure sort container is above other elements
  },
  sortOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent overlay
    zIndex: 1000,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sortButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sortArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  sortOptions: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingVertical: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 4,
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  offlineIndicator: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
  },
  offlineText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  bottomNavigation: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modernNavItem: {
    paddingVertical: 8,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;