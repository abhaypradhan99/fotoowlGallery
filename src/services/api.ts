const API_BASE = process.env.EXPO_PUBLIC_API || 'https://openapi.fotoowl.ai/open/event/image-list?event_id=154770&page=0&page_size=40&key=4030&order_by=2&order_asc=true';
console.log('API_BASE:', API_BASE);
const EVENT_ID = '154770';
const API_KEY =  '4030';

export interface ImageType {
  id: number;
  event_id: number;
  name: string;
  mime_type: string;
  width: number;
  height: number;
  low_path: string;
  raw_path: string;
  med_path: string;
  raw_id: string;
  low_id: string;
  med_id: string;
  source: number;
  collaborator_id: string;
  click_time: string;
  update_time: string;
  size: number;
  create_time: string;
  path_dict_array: null | any[];
  is_hidden: boolean;
  upload_by: number;
  compression_factor: number;
  note: string | null;
  collaborator_name: string | null;
  img_url: string;
  thumbnail_url: string;
  med_url: string;
  high_url: string;
  path_dict: {
    img_url: string;
    thumbnail_url: string;
    med_url: string;
    high_url: string;
  };
  caption?: string; // Optional, as it's not in the provided data
  author?: string; // Map to collaborator_name
  tags?: string[]; // Mock tags for filtering
  views?: number; // Mock views for popularity sorting
}
interface ApiResponse {
  data: ImageType[];
  total: number;
  page: number;
  page_size: number;
}

export const fetchImages = async (page = 0, pageSize = 40, orderBy = 2, orderAsc = true, signal?: AbortSignal): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    event_id: EVENT_ID,
    page: page.toString(),
    page_size: pageSize.toString(),
    key: API_KEY,
    order_by: orderBy.toString(),
    order_asc: orderAsc.toString(),
  });

    const response = await fetch(`${API_BASE}?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Retry with backoff
export const fetchWithRetry = async (fn: () => Promise<ApiResponse>, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};