/**
 * Gallery storage utilities using localStorage
 */

const STORAGE_KEY = 'gach-bong-gallery';
const MAX_ITEMS = 20;

export interface CustomPalette {
  type: 'custom';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  detail: string;
}

export interface GalleryItemSettings {
  // Background
  pattern?: number;
  patterns?: number[];
  palette: number | CustomPalette;
  ratio: string;
  resolution: { width: number; height: number };
  format: 'png' | 'jpeg' | 'webp';
  // Avatar
  gridSize?: 1 | 2 | 3;
  // Effects
  enableTexture?: boolean;
  enableWear?: boolean;
  enableGrout?: boolean;
}

export interface GalleryItem {
  id: string;
  type: 'background' | 'avatar';
  createdAt: number;
  thumbnail: string;
  settings: GalleryItemSettings;
}

/**
 * Get all gallery items from localStorage
 */
export const getGalleryItems = (): GalleryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as GalleryItem[];
  } catch {
    return [];
  }
};

/**
 * Add new item to gallery
 * Auto-removes oldest if exceeds MAX_ITEMS
 */
export const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'createdAt'>): void => {
  const items = getGalleryItems();

  const newItem: GalleryItem = {
    ...item,
    id: generateId(),
    createdAt: Date.now(),
  };

  items.unshift(newItem);

  // Keep only MAX_ITEMS
  const trimmedItems = items.slice(0, MAX_ITEMS);

  saveGalleryItems(trimmedItems);
};

/**
 * Remove item from gallery by ID
 */
export const removeGalleryItem = (id: string): void => {
  const items = getGalleryItems();
  const filtered = items.filter(item => item.id !== id);
  saveGalleryItems(filtered);
};

/**
 * Clear all gallery items
 */
export const clearGallery = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `gb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Save items to localStorage
 */
const saveGalleryItems = (items: GalleryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save gallery:', e);
  }
};

/**
 * Get storage usage info
 */
export const getStorageInfo = (): { itemCount: number; estimatedSize: string } => {
  const items = getGalleryItems();
  const data = JSON.stringify(items);
  const bytes = new Blob([data]).size;

  let size: string;
  if (bytes < 1024) {
    size = `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    size = `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return { itemCount: items.length, estimatedSize: size };
};
