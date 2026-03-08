/**
 * Pattern metadata for Studio
 * Provides Vietnamese names and categories for the 20 patterns
 */

export type PatternCategory = 'traditional_floral' | 'geometric' | 'nature' | 'heritage';

export interface PatternInfo {
  id: number;
  name: string;
  nameVn: string;
  category: PatternCategory;
  description: string;
}

export const patternList: PatternInfo[] = [
  // === Hoa văn truyền thống (Traditional floral) ===
  { id: 0, name: 'HOA_SEN', nameVn: 'Hoa Sen', category: 'traditional_floral', description: 'Lotus flower, 8-fold petals' },
  { id: 1, name: 'BONG_MAI', nameVn: 'Bông Mai', category: 'traditional_floral', description: 'Plum blossom, 5-petal' },
  { id: 2, name: 'BONG_CUC', nameVn: 'Bông Cúc', category: 'traditional_floral', description: 'Chrysanthemum, 8-pointed star' },
  { id: 3, name: 'HOA_THI', nameVn: 'Hoa Thị', category: 'traditional_floral', description: 'Cross-star flower' },
  { id: 4, name: 'HOA_CHANH', nameVn: 'Hoa Chanh', category: 'traditional_floral', description: 'Lemon blossom, 8-pointed star' },
  { id: 5, name: 'HOA_CUC_DAI', nameVn: 'Hoa Cúc Đại', category: 'traditional_floral', description: 'Large chrysanthemum, 12-petal' },
  { id: 6, name: 'LA_SEN', nameVn: 'Lá Sen', category: 'traditional_floral', description: 'Lotus leaves, 4-fold curved' },

  // === Hình học (Geometric) ===
  { id: 7, name: 'CANH_QUAT', nameVn: 'Cánh Quạt', category: 'geometric', description: 'Fan blades / propeller, 4-fold' },
  { id: 8, name: 'BAT_GIAC', nameVn: 'Bát Giác', category: 'geometric', description: 'Octagonal frame with inner star' },
  { id: 9, name: 'KIM_CUONG', nameVn: 'Kim Cương', category: 'geometric', description: 'Nested diamond frames' },
  { id: 10, name: 'BAN_CO', nameVn: 'Bàn Cờ', category: 'geometric', description: 'Chessboard 4×4' },
  { id: 11, name: 'CHONG_CHONG', nameVn: 'Chong Chóng', category: 'geometric', description: 'Pinwheel / windmill' },
  { id: 12, name: 'LUC_GIAC', nameVn: 'Lục Giác', category: 'geometric', description: 'Hexagonal star' },
  { id: 13, name: 'DONG_TAM', nameVn: 'Đồng Tâm', category: 'geometric', description: 'Concentric bands' },

  // === Tự nhiên (Nature-inspired) ===
  { id: 14, name: 'VAY_CA', nameVn: 'Vảy Cá', category: 'nature', description: 'Fish scale arcs' },
  { id: 15, name: 'SONG_NUOC', nameVn: 'Sóng Nước', category: 'nature', description: 'Water wave arcs' },
  { id: 16, name: 'MAY_CUON', nameVn: 'Mây Cuốn', category: 'nature', description: 'Rolling cloud spirals' },
  { id: 17, name: 'DAY_LEO', nameVn: 'Dây Leo', category: 'nature', description: 'Vine scroll tendrils' },

  // === Di sản Việt Nam (Heritage) ===
  { id: 18, name: 'HOI_VAN', nameVn: 'Hồi Văn', category: 'heritage', description: 'Greek key / meander' },
  { id: 19, name: 'GACH_TAU', nameVn: 'Gạch Tàu', category: 'heritage', description: 'Terracotta cross pattern' },
];

export const getPatternById = (id: number): PatternInfo | undefined => {
  return patternList.find(p => p.id === id);
};

export const getPatternsByCategory = (category: PatternCategory): PatternInfo[] => {
  return patternList.filter(p => p.category === category);
};

export const getCategoryLabel = (category: PatternCategory): string => {
  const labels: Record<PatternCategory, string> = {
    traditional_floral: 'Hoa văn truyền thống',
    geometric: 'Hình học',
    nature: 'Tự nhiên',
    heritage: 'Di sản Việt Nam',
  };
  return labels[category];
};
