
import { useRoute, useNavigation } from '@react-navigation/native';
import ImageViewerScreen from './ImageViewerScreen';
import React, { useState } from 'react';
import { ImageType } from '../services/api';

const ImageViewerScreenWrapper = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { images = [], selectedIndex = 0 } = route.params || {};
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    console.log('ImageViewerScreenWrapper: Closing modal');
    setVisible(false);
    navigation.goBack();
  };

  return (
    <ImageViewerScreen
      visible={visible}
      images={images as ImageType[]}
      selectedIndex={selectedIndex}
      onClose={handleClose}
    />
  );
};

export default ImageViewerScreenWrapper;
