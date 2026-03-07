#pragma once
#include "geometry.h"
#include "renderer.h"
#include <algorithm>
#include <functional>
#include <vector>

namespace gachbong {

// A color palette for a tile pattern
struct Palette {
  Color primary;
  Color secondary;
  Color accent;
  Color background;
  Color detail;
};

// Render quality/style options — all fields have sensible defaults
struct RenderOptions {
  // Tile appearance
  double borderWidth = 1.0;  // Tile border thickness
  bool showBorder = true;    // Show tile border
  double cornerRadius = 0.0; // Rounded corners (0 = sharp)
  double padding = 0.04;     // Inner padding ratio (default 4%)

  // Material effects (hints for platform renderer)
  bool enableTexture = false;     // Surface grain/noise texture
  double textureIntensity = 0.15; // Texture opacity (0..1)
  bool enableWear = false;        // Aging/wear marks
  double wearAmount = 0.3;        // Wear intensity (0..1)
  bool enableBevel = false;       // Edge bevel/depth illusion
  double bevelSize = 0.02;        // Bevel size ratio

  // Color adjustments
  double saturation = 1.0; // Color saturation multiplier
  double brightness = 1.0; // Color brightness multiplier
  double opacity = 1.0;    // Overall tile opacity

  // Tessellation
  bool showGrout = false;             // Show grout lines between tiles
  double groutWidth = 2.0;            // Grout line width in pixels
  Color groutColor = {180, 175, 165}; // Grout color (cement grey)
};

// Pattern ID enum — authentic Vietnamese gạch bông motifs (20 patterns)
enum class PatternType {
  // === Hoa văn truyền thống (Traditional floral) ===
  HOA_SEN = 0, // Hoa Sen — Lotus flower, 8-fold petals
  BONG_MAI,    // Bông Mai — Plum blossom, 5-petal
  BONG_CUC,    // Bông Cúc — Chrysanthemum, 8-pointed star
  HOA_THI,     // Hoa Thị — Cross-star flower (trường học cũ)
  HOA_CHANH,   // Hoa Chanh — Lemon blossom, 8-pointed star
  HOA_CUC_DAI, // Hoa Cúc Đại — Large chrysanthemum, 12-petal
  LA_SEN,      // Lá Sen — Lotus leaves, 4-fold curved

  // === Hình học (Geometric) ===
  CANH_QUAT,   // Cánh Quạt — Fan blades / propeller, 4-fold rotation
  BAT_GIAC,    // Bát Giác — Octagonal frame with inner star
  KIM_CUONG,   // Kim Cương — Nested diamond frames
  BAN_CO,      // Bàn Cờ — Chessboard 4×4
  CHONG_CHONG, // Chong Chóng — Pinwheel / windmill
  LUC_GIAC,    // Lục Giác — Hexagonal star
  DONG_TAM,    // Đồng Tâm — Concentric bands

  // === Tự nhiên (Nature-inspired) ===
  VAY_CA,    // Vảy Cá — Fish scale arcs
  SONG_NUOC, // Sóng Nước — Water wave arcs
  MAY_CUON,  // Mây Cuốn — Rolling cloud spirals
  DAY_LEO,   // Dây Leo — Vine scroll tendrils

  // === Di sản Việt Nam (Heritage) ===
  HOI_VAN,  // Hồi Văn — Greek key / meander
  GACH_TAU, // Gạch Tàu — Terracotta cross pattern

  COUNT // = 20
};

// Traditional Vietnamese cement tile color palettes (12 palettes)
const Palette PALETTES[] = {
    // 0: Gạch Cũ Sài Gòn — Terracotta & Navy (classic Saigon colonial)
    {{178, 60, 45},   // terracotta red
     {35, 45, 85},    // dark navy
     {235, 215, 175}, // cream
     {245, 238, 225}, // warm white
     {120, 35, 30}},  // deep red
    // 1: Xưa Huế — Deep Blue & Gold (imperial Huế)
    {{30, 60, 130},   // deep blue
     {195, 155, 55},  // gold ochre
     {140, 35, 50},   // burgundy
     {248, 243, 232}, // off-white
     {20, 40, 90}},   // darker blue
    // 2: Đồng Bằng — Jade Green & Warm Brown (delta countryside)
    {{40, 115, 80},   // jade green
     {145, 90, 55},   // warm brown
     {210, 130, 50},  // orange
     {248, 244, 235}, // pearl
     {28, 80, 55}},   // darker green
    // 3: Hoàng Cung — Royal Blue & Crimson (palace / temple)
    {{35, 70, 160},   // royal blue
     {180, 40, 50},   // crimson
     {210, 175, 55},  // gold
     {250, 247, 240}, // ivory
     {25, 50, 110}},  // darker blue
    // 4: Phố Cổ Hà Nội — Charcoal & Teal (old quarter)
    {{55, 60, 70},    // charcoal
     {40, 120, 125},  // teal
     {175, 110, 120}, // dusty rose
     {240, 237, 232}, // light gray
     {35, 38, 45}},   // dark charcoal
    // 5: Nâu Đất — Dark Brown & Burnt Orange (earthy)
    {{90, 55, 35},    // dark brown
     {195, 105, 45},  // burnt orange
     {120, 140, 95},  // sage
     {245, 238, 222}, // sand
     {60, 35, 22}},   // deep brown
    // 6: Sài Gòn Retro — Pastel Pink & Mint (1960s Saigon)
    {{215, 140, 150},  // pastel pink
     {130, 195, 175},  // mint green
     {240, 200, 120},  // soft gold
     {252, 248, 242},  // warm white
     {165, 100, 110}}, // muted rose
    // 7: Chùa Cổ — Vermillion & Gold (temple/pagoda)
    {{195, 45, 30},   // vermillion red
     {210, 170, 45},  // bright gold
     {85, 45, 25},    // dark wood
     {248, 240, 220}, // warm cream
     {140, 30, 20}},  // deep vermillion
    // 8: Biển Xanh — Ocean Blue & Sand (coastal)
    {{35, 100, 170},  // ocean blue
     {215, 195, 155}, // sand
     {70, 155, 180},  // turquoise
     {245, 242, 235}, // sea foam white
     {25, 70, 120}},  // deep sea
    // 9: Đêm Phố — Midnight & Amber (modern night market)
    {{30, 30, 50},   // midnight blue-black
     {220, 160, 50}, // amber/lantern gold
     {160, 55, 70},  // neon pink muted
     {45, 42, 58},   // dark purple-gray
     {18, 18, 35}},  // near-black
    // 10: Lụa Hà Đông — Silk Pink & Ivory (traditional silk)
    {{195, 120, 140}, // silk pink
     {175, 155, 125}, // raw silk
     {225, 190, 160}, // peach silk
     {250, 245, 238}, // ivory
     {150, 85, 105}}, // deeper pink
    // 11: Cà Phê Sữa — Coffee Brown & Cream (Vietnamese coffee)
    {{110, 70, 45},   // coffee brown
     {225, 200, 170}, // condensed milk cream
     {170, 120, 75},  // café au lait
     {245, 240, 230}, // milk white
     {75, 45, 28}},   // espresso
};

constexpr int PALETTE_COUNT = 12;

// Render a specific pattern onto a tile area
// cx, cy = center of tile, size = tile dimension
void renderPattern(IRenderer &renderer, PatternType type,
                   const Palette &palette, double cx, double cy, double size);

// Render with options (texture, wear, bevel, etc.)
void renderPattern(IRenderer &renderer, PatternType type,
                   const Palette &palette, double cx, double cy, double size,
                   const RenderOptions &options);

// Adjust palette colors based on render options (brightness, saturation)
Palette adjustPalette(const Palette &palette, const RenderOptions &opts);

// Get total number of patterns
int getPatternCount();

// Get total number of built-in palettes
int getPaletteCountBuiltin();

// Get pattern name (Vietnamese)
const char *getPatternName(PatternType type);

} // namespace gachbong
