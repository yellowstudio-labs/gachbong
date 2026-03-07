#include "patterns/geometric.h"
#include "patterns/heritage.h"
#include "patterns/nature.h"
#include "patterns/traditional_floral.h"
#include <algorithm>
#include <cmath>
#include <gachbong/patterns.h>

namespace gachbong {

// ========== Color Helpers ==========

static Color adjustColor(const Color &c, double brightness, double saturation) {
  // Convert to HSL-like adjustment
  double r = c.r / 255.0, g = c.g / 255.0, b = c.b / 255.0;
  double maxC = std::max({r, g, b}), minC = std::min({r, g, b});
  double l = (maxC + minC) / 2.0;

  // Apply brightness
  r = std::clamp(r * brightness, 0.0, 1.0);
  g = std::clamp(g * brightness, 0.0, 1.0);
  b = std::clamp(b * brightness, 0.0, 1.0);

  // Apply saturation (lerp toward gray)
  if (saturation != 1.0) {
    double gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;
    r = std::clamp(r, 0.0, 1.0);
    g = std::clamp(g, 0.0, 1.0);
    b = std::clamp(b, 0.0, 1.0);
  }

  return Color((int)(r * 255), (int)(g * 255), (int)(b * 255), c.a);
}

Palette adjustPalette(const Palette &palette, const RenderOptions &opts) {
  if (opts.brightness == 1.0 && opts.saturation == 1.0) {
    return palette;
  }
  return {
      adjustColor(palette.primary, opts.brightness, opts.saturation),
      adjustColor(palette.secondary, opts.brightness, opts.saturation),
      adjustColor(palette.accent, opts.brightness, opts.saturation),
      adjustColor(palette.background, opts.brightness, opts.saturation),
      adjustColor(palette.detail, opts.brightness, opts.saturation),
  };
}

// ========== Dispatcher ==========
void renderPattern(IRenderer &renderer, PatternType type,
                   const Palette &palette, double cx, double cy, double size) {
  using namespace patterns;

  switch (type) {
  case PatternType::HOA_SEN:
    renderHoaSen(renderer, palette, cx, cy, size);
    break;
  case PatternType::BONG_MAI:
    renderBongMai(renderer, palette, cx, cy, size);
    break;
  case PatternType::BONG_CUC:
    renderBongCuc(renderer, palette, cx, cy, size);
    break;
  case PatternType::HOA_THI:
    renderHoaThi(renderer, palette, cx, cy, size);
    break;
  case PatternType::HOA_CHANH:
    renderHoaChanh(renderer, palette, cx, cy, size);
    break;
  case PatternType::HOA_CUC_DAI:
    renderHoaCucDai(renderer, palette, cx, cy, size);
    break;
  case PatternType::LA_SEN:
    renderLaSen(renderer, palette, cx, cy, size);
    break;
  case PatternType::CANH_QUAT:
    renderCanhQuat(renderer, palette, cx, cy, size);
    break;
  case PatternType::BAT_GIAC:
    renderBatGiac(renderer, palette, cx, cy, size);
    break;
  case PatternType::KIM_CUONG:
    renderKimCuong(renderer, palette, cx, cy, size);
    break;
  case PatternType::BAN_CO:
    renderBanCo(renderer, palette, cx, cy, size);
    break;
  case PatternType::CHONG_CHONG:
    renderChongChong(renderer, palette, cx, cy, size);
    break;
  case PatternType::LUC_GIAC:
    renderLucGiac(renderer, palette, cx, cy, size);
    break;
  case PatternType::DONG_TAM:
    renderDongTam(renderer, palette, cx, cy, size);
    break;
  case PatternType::VAY_CA:
    renderVayCa(renderer, palette, cx, cy, size);
    break;
  case PatternType::SONG_NUOC:
    renderSongNuoc(renderer, palette, cx, cy, size);
    break;
  case PatternType::MAY_CUON:
    renderMayCuon(renderer, palette, cx, cy, size);
    break;
  case PatternType::DAY_LEO:
    renderDayLeo(renderer, palette, cx, cy, size);
    break;
  case PatternType::HOI_VAN:
    renderHoiVan(renderer, palette, cx, cy, size);
    break;
  case PatternType::GACH_TAU:
    renderGachTau(renderer, palette, cx, cy, size);
    break;
  default:
    renderHoaSen(renderer, palette, cx, cy, size);
    break;
  }
}

// ========== Overloaded Dispatcher with RenderOptions ==========
void renderPattern(IRenderer &renderer, PatternType type,
                   const Palette &palette, double cx, double cy, double size,
                   const RenderOptions &opts) {
  double h = size * 0.5;
  double tileX = cx - h;
  double tileY = cy - h;

  // Adjust palette for brightness/saturation
  Palette adjusted = adjustPalette(palette, opts);

  // Set opacity if not 1.0
  if (opts.opacity < 1.0) {
    renderer.setOpacity(opts.opacity);
  }

  // Bevel shadow (bottom-right edge darkening)
  if (opts.enableBevel) {
    double bevel = size * opts.bevelSize;
    Color shadow = adjusted.detail.withAlpha(0.25);
    renderer.drawPolygon({{tileX + bevel, tileY + size},
                          {tileX + size, tileY + size},
                          {tileX + size, tileY + bevel},
                          {tileX + size - bevel, tileY + bevel},
                          {tileX + size - bevel, tileY + size - bevel},
                          {tileX + bevel, tileY + size - bevel}},
                         shadow);
    // Top-left highlight
    Color highlight = Color(255, 255, 255, 0.12);
    renderer.drawPolygon({{tileX, tileY},
                          {tileX + size - bevel, tileY},
                          {tileX + size - bevel, tileY + bevel},
                          {tileX + bevel, tileY + bevel},
                          {tileX + bevel, tileY + size - bevel},
                          {tileX, tileY + size - bevel}},
                         highlight);
  }

  // Clip to tile area
  renderer.save();
  renderer.clipRect(tileX, tileY, size, size);

  // Render the base pattern
  renderPattern(renderer, type, adjusted, cx, cy, size);

  // Apply texture overlay
  if (opts.enableTexture) {
    unsigned int seed =
        static_cast<unsigned int>(cx * 1000 + cy * 7 + static_cast<int>(type));
    renderer.applyTextureOverlay(tileX, tileY, size, size,
                                 opts.textureIntensity, seed);
  }

  // Apply wear effect
  if (opts.enableWear) {
    unsigned int seed = static_cast<unsigned int>(cx * 31 + cy * 17 +
                                                  static_cast<int>(type) * 3);
    renderer.applyWearEffect(tileX, tileY, size, size, opts.wearAmount, seed);
  }

  renderer.restore(); // restore clip

  // Restore opacity
  if (opts.opacity < 1.0) {
    renderer.setOpacity(1.0);
  }
}

int getPatternCount() { return static_cast<int>(PatternType::COUNT); }

int getPaletteCountBuiltin() { return PALETTE_COUNT; }

const char *getPatternName(PatternType type) {
  static const char *names[] = {
      "Hoa Sen",     "Bông Mai",    "Bông Cúc",  "Hoa Thị",  "Hoa Chanh",
      "Hoa Cúc Đại", "Lá Sen",      "Cánh Quạt", "Bát Giác", "Kim Cương",
      "Bàn Cờ",      "Chong Chóng", "Lục Giác",  "Đồng Tâm", "Vảy Cá",
      "Sóng Nước",   "Mây Cuốn",    "Dây Leo",   "Hồi Văn",  "Gạch Tàu"};
  int idx = static_cast<int>(type);
  if (idx >= 0 && idx < static_cast<int>(PatternType::COUNT))
    return names[idx];
  return "Unknown";
}

} // namespace gachbong
