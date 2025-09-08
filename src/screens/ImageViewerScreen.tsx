import React from 'react';
import { Modal, Dimensions, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { ImageType } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import * as Share from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

interface Props {
  visible: boolean;
  images: ImageType[];
  selectedIndex: number;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const ImageViewerScreen: React.FC<Props> = ({ visible, images = [], selectedIndex, onClose }) => {
  const { colors } = useTheme();

  if (!images || images.length === 0) {
    console.log('ImageViewerScreen: No images provided');
    return (
      <Modal visible={visible} onRequestClose={onClose} statusBarTranslucent animationType="fade">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.noImagesText, { color: colors.text }]}>
            No images available
          </Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.closeButtonText, { color: colors.background }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const handleShare = async (imageUrl: string) => {
    try {
      console.log('Attempting to share image:', imageUrl);
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Invalid or missing image URL');
      }
      
      const fileName = (imageUrl.split('/').pop() || 'image.jpg').split('?')[0];
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      console.log('Downloading image to:', fileUri);

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      if (!fileInfo.exists) {
        throw new Error('Downloaded file does not exist');
      }

      console.log('Sharing file:', downloadResult.uri, 'File exists:', fileInfo.exists);
      await Share.shareAsync(downloadResult.uri);

      console.log('Image shared successfully');
    } catch (error) {
      console.error('Error sharing image:', error);
      alert('Failed to share image: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSave = async (imageUrl: string) => {
    try {
      console.log('Saving image:', imageUrl);
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Invalid image URL');
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Media library permission denied');
        alert('Permission denied to access media library');
        return;
      }

      const fileName = (imageUrl.split('/').pop() || 'image.jpg').split('?')[0];
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      console.log('Downloading to:', fileUri);

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      console.log('Image saved to gallery');
      alert('Image saved to gallery!');
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image: ' + (error.message || 'Unknown error'));
    }
  };

  const imageUrls = images.map((img, index) => {
    console.log(`Mapping image ${index}:`, img.img_url);
    return { url: img.img_url };
  });

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="fade"
    >
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}>
        <ImageViewer
          imageUrls={imageUrls}
          index={selectedIndex}
          enableSwipeDown={true}
          onSwipeDown={onClose}
          onClick={onClose}
          enablePreload={true}
          saveToLocalByLongPress={false}
          backgroundColor="transparent"
          renderHeader={() => (
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  onPress={() => {
                    console.log('Closing ImageViewerScreen');
                    onClose();
                  }}
                  style={styles.headerCloseButton}
                >
                  <Text style={styles.headerCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.imageCounter}>
                  {selectedIndex + 1} / {images.length}
                </Text>
              </View>
            </View>
          )}
          renderFooter={(currentIndex) => (
            <View style={styles.footer}>
              <View style={styles.footerContent}>
                <TouchableOpacity
                  onPress={() => handleSave(images[currentIndex]?.img_url || '')}
                  style={[styles.actionButton, styles.saveButton]}
                  disabled={!images[currentIndex]?.img_url}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>📥 Save</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleShare(images[currentIndex]?.img_url || '')}
                  style={[styles.actionButton, styles.shareButton]}
                  disabled={!images[currentIndex]?.img_url}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>📤 Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // No images state styles
  noImagesText: {
    textAlign: 'center',
    marginTop: height / 2 - 50,
    fontSize: 18,
    fontWeight: '500',
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Header styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Status bar padding
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerCloseText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  
  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 200,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingBottom: 50, // Safe area padding
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ImageViewerScreen;