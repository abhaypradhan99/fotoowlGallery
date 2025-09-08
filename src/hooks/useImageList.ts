import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchImages, fetchWithRetry } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface ApiResponse {
  ok: boolean;
  data: {
    image_list: ImageType[];
    total?: number;
  };
}

interface UseImageListProps {
  orderBy?: number;
  orderAsc?: boolean;
}

export const useImageList = ({ orderBy = 2, orderAsc = true }: UseImageListProps = {}) => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadImages = useCallback(
    async (append = false, isRefresh = false) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const isOnline = await NetInfo.fetch().then((state) => state.isConnected);
        if (!isOnline && !append && images.length === 0) {
          const cached = await AsyncStorage.getItem('cachedImages');
          if (cached) {
            setImages(JSON.parse(cached));
            setHasMore(false);
            return;
          }
          throw new Error('Offline and no cache');
        }

        const fn = () =>
          fetchImages(page, 40, orderBy, orderAsc, abortControllerRef.current?.signal);
        const response: ApiResponse = await fetchWithRetry(fn);

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const newImages = append
          ? [...images, ...response.data.image_list]
          : response.data.image_list;
        setImages(newImages);
        setHasMore(response.data.image_list.length === 40);
        setPage((prev) => (append ? prev + 1 : 1));

        await AsyncStorage.setItem('cachedImages', JSON.stringify(newImages));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [images, page, orderBy, orderAsc, loading]
  );

  useEffect(() => {
    loadImages(false, true);
  }, [orderBy, orderAsc]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const refresh = () => loadImages(false, true);
  const loadMore = () => hasMore && loadImages(true);

  return { images, loading, error, hasMore, refresh, loadMore };
};