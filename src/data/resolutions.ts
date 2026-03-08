/**
 * Resolution presets for various devices
 * Used in Studio for export resolution selection
 * Note: All dimensions are in PORTRAIT orientation for mobile devices
 */

export interface ResolutionPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  category: 'iOS' | 'Mac' | 'Windows' | 'Social' | 'Other';
}

// iPhone dimensions are in PORTRAIT orientation (height > width)
export const resolutionPresets: ResolutionPreset[] = [
  // iOS Devices - PORTRAIT orientation
  { id: 'iphone-14', label: 'iPhone 14 - 1170×2550', width: 1170, height: 2550, category: 'iOS' },
  { id: 'iphone-14-pro', label: 'iPhone 14 Pro - 1179×2556', width: 1179, height: 2556, category: 'iOS' },
  { id: 'iphone-14-pro-max', label: 'iPhone 14 Pro Max - 1290×2796', width: 1290, height: 2796, category: 'iOS' },
  { id: 'iphone-15-pro', label: 'iPhone 15 Pro - 1179×2556', width: 1179, height: 2556, category: 'iOS' },
  { id: 'iphone-15-pro-max', label: 'iPhone 15 Pro Max - 1290×2796', width: 1290, height: 2796, category: 'iOS' },
  { id: 'iphone-16-pro', label: 'iPhone 16 Pro - 1206×2622', width: 1206, height: 2622, category: 'iOS' },
  { id: 'iphone-16-pro-max', label: 'iPhone 16 Pro Max - 1320×2868', width: 1320, height: 2868, category: 'iOS' },
  { id: 'iphone-se', label: 'iPhone SE - 750×1334', width: 750, height: 1334, category: 'iOS' },

  // iPad Devices - PORTRAIT orientation
  { id: 'ipad-pro-11', label: 'iPad Pro 11" - 1668×2388', width: 1668, height: 2388, category: 'iOS' },
  { id: 'ipad-pro-12.9', label: 'iPad Pro 12.9" - 2048×2732', width: 2048, height: 2732, category: 'iOS' },
  { id: 'ipad-air', label: 'iPad Air 10.9" - 1640×2360', width: 1640, height: 2360, category: 'iOS' },
  { id: 'ipad-mini', label: 'iPad mini 8.3" - 1488×2266', width: 1488, height: 2266, category: 'iOS' },

  // Mac Devices - LANDSCAPE orientation
  { id: 'macbook-air-13', label: 'MacBook Air 13" - 2560×1600', width: 2560, height: 1600, category: 'Mac' },
  { id: 'macbook-pro-14', label: 'MacBook Pro 14" - 3024×1964', width: 3024, height: 1964, category: 'Mac' },
  { id: 'macbook-pro-16', label: 'MacBook Pro 16" - 3456×2234', width: 3456, height: 2234, category: 'Mac' },
  { id: 'macbook-air-15', label: 'MacBook Air 15" - 2880×1864', width: 2880, height: 1864, category: 'Mac' },
  { id: 'imac-24', label: 'iMac 24" - 4480×2520', width: 4480, height: 2520, category: 'Mac' },
  { id: 'imac-27', label: 'iMac 27" - 5120×2880', width: 5120, height: 2880, category: 'Mac' },

  // Windows Devices - LANDSCAPE orientation
  { id: 'windows-hd', label: 'Windows HD - 1920×1080', width: 1920, height: 1080, category: 'Windows' },
  { id: 'windows-2k', label: 'Windows 2K - 2560×1440', width: 2560, height: 1440, category: 'Windows' },
  { id: 'windows-4k', label: 'Windows 4K - 3840×2160', width: 3840, height: 2160, category: 'Windows' },
  { id: 'windows-fhd-plus', label: 'Windows FHD+ - 1920×1280', width: 1920, height: 1280, category: 'Windows' },

  // Social Media - Various orientations
  { id: 'instagram-post', label: 'Instagram Post - 1080×1080', width: 1080, height: 1080, category: 'Social' },
  { id: 'instagram-story', label: 'Instagram Story - 1080×1920', width: 1080, height: 1920, category: 'Social' },
  { id: 'instagram-landscape', label: 'Instagram Landscape - 1080×566', width: 1080, height: 566, category: 'Social' },
  { id: 'facebook-post', label: 'Facebook Post - 1200×630', width: 1200, height: 630, category: 'Social' },
  { id: 'facebook-cover', label: 'Facebook Cover - 1640×624', width: 1640, height: 624, category: 'Social' },
  { id: 'facebook-avatar-std', label: 'Facebook Avatar - 320×320', width: 320, height: 320, category: 'Social' },
  { id: 'facebook-avatar-hq', label: 'Facebook Avatar HD - 512×512', width: 512, height: 512, category: 'Social' },
  { id: 'twitter-post', label: 'Twitter/X Post - 1600×900', width: 1600, height: 900, category: 'Social' },
  { id: 'twitter-header', label: 'Twitter/X Header - 1500×500', width: 1500, height: 500, category: 'Social' },
  { id: 'youtube-thumb', label: 'YouTube Thumbnail - 1280×720', width: 1280, height: 720, category: 'Social' },
  { id: 'youtube-banner', label: 'YouTube Banner - 2560×1440', width: 2560, height: 1440, category: 'Social' },
  { id: 'tiktok-cover', label: 'TikTok Cover - 1080×1920', width: 1080, height: 1920, category: 'Social' },
  { id: 'linkedin-banner', label: 'LinkedIn Banner - 1584×396', width: 1584, height: 396, category: 'Social' },
  { id: 'pinterest-pin', label: 'Pinterest Pin - 1000×1500', width: 1000, height: 1500, category: 'Social' },

  // Avatar sizes - SQUARE
  { id: 'avatar-256', label: 'Avatar 256×256', width: 256, height: 256, category: 'Other' },
  { id: 'avatar-400', label: 'Avatar 400×400 (FB, IG, LinkedIn)', width: 400, height: 400, category: 'Other' },
  { id: 'avatar-512', label: 'Avatar 512×512', width: 512, height: 512, category: 'Other' },
  { id: 'avatar-800', label: 'Avatar 800×800 (YouTube)', width: 800, height: 800, category: 'Other' },
  { id: 'avatar-1024', label: 'Avatar 1024×1024 (HD)', width: 1024, height: 1024, category: 'Other' },
  { id: 'avatar-custom', label: 'Tùy chỉnh', width: 0, height: 0, category: 'Other' },

  // Wallpaper sizes - PORTRAIT orientation
  { id: 'wallpaper-hd', label: 'HD Wallpaper - 1080×1920', width: 1080, height: 1920, category: 'Other' },
  { id: 'wallpaper-2k', label: '2K Wallpaper - 1440×2560', width: 1440, height: 2560, category: 'Other' },
  { id: 'wallpaper-4k', label: '4K Wallpaper - 2160×3840', width: 2160, height: 3840, category: 'Other' },
  { id: 'wallpaper-ultrawide', label: 'Ultrawide - 1440×3440', width: 1440, height: 3440, category: 'Other' },

  // Custom
  { id: 'custom', label: 'Tùy chỉnh', width: 0, height: 0, category: 'Other' },
];

export const getResolutionsByCategory = () => {
  const categories: Record<string, ResolutionPreset[]> = {};
  resolutionPresets.forEach(preset => {
    if (!categories[preset.category]) {
      categories[preset.category] = [];
    }
    categories[preset.category].push(preset);
  });
  return categories;
};

export const findResolutionById = (id: string): ResolutionPreset | undefined => {
  return resolutionPresets.find(p => p.id === id);
};
