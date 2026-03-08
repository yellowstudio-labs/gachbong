// ============================================
// Gạch Bông — Avatar Image Exporter
// Renders a 2x2 grid of tile patterns to PNG
// for use as product icon on landing page
// ============================================

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <vector>

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

#include <gachbong/geometry.h>
#include <gachbong/patterns.h>
#include <gachbong/renderer.h>

using namespace gachbong;

// ─── Software Renderer ─────────────────────────────────────────────────────
// Renders to an RGBA pixel buffer using basic rasterization

class SoftwareRenderer : public IRenderer {
public:
  SoftwareRenderer(int w, int h) : width(w), height(h), pixels(w * h * 4, 255) {
    transformStack.push_back({0, 0, 1, 1, 0}); // identity
  }

  uint8_t *data() { return pixels.data(); }
  int getWidth() const { return width; }
  int getHeight() const { return height; }

  // ─── Primitive Drawing ─────────────────────────────────────────────

  void drawCircle(Point center, double radius, const Color &fill,
                  const Color &stroke, double lineWidth) override {
    center = transform(center);
    radius *= currentScale();

    int x0 = std::max(0, (int)(center.x - radius - lineWidth));
    int y0 = std::max(0, (int)(center.y - radius - lineWidth));
    int x1 = std::min(width - 1, (int)(center.x + radius + lineWidth + 1));
    int y1 = std::min(height - 1, (int)(center.y + radius + lineWidth + 1));

    for (int y = y0; y <= y1; y++) {
      for (int x = x0; x <= x1; x++) {
        double dx = x - center.x;
        double dy = y - center.y;
        double dist = std::sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          blendPixel(x, y, fill);
        } else if (lineWidth > 0 && dist <= radius + lineWidth &&
                   stroke.a > 0) {
          blendPixel(x, y, stroke);
        }
      }
    }
  }

  void drawArc(Point center, double radius, double startAngle, double endAngle,
               const Color &fill, const Color &stroke,
               double lineWidth) override {
    // Render arc as a filled polygon (pie slice)
    center = transform(center);
    radius *= currentScale();
    int segments = std::max(12, (int)(radius * 2));
    std::vector<Point> pts;
    pts.push_back(center);
    for (int i = 0; i <= segments; i++) {
      double a = startAngle + (endAngle - startAngle) * i / segments;
      pts.push_back({center.x + radius * cos(a), center.y + radius * sin(a)});
    }
    fillPolygonRaw(pts, fill);
    if (lineWidth > 0 && stroke.a > 0) {
      for (size_t i = 0; i < pts.size(); i++) {
        size_t j = (i + 1) % pts.size();
        drawLineRaw(pts[i], pts[j], stroke, lineWidth);
      }
    }
  }

  void drawPolygon(const std::vector<Point> &points, const Color &fill,
                   const Color &stroke, double lineWidth) override {
    std::vector<Point> xfPts;
    for (auto &p : points)
      xfPts.push_back(transform(p));
    fillPolygonRaw(xfPts, fill);
    if (lineWidth > 0 && stroke.a > 0) {
      double lw = lineWidth * currentScale();
      for (size_t i = 0; i < xfPts.size(); i++) {
        size_t j = (i + 1) % xfPts.size();
        drawLineRaw(xfPts[i], xfPts[j], stroke, lw);
      }
    }
  }

  void drawLine(Point from, Point to, const Color &color,
                double lineWidth) override {
    from = transform(from);
    to = transform(to);
    drawLineRaw(from, to, color, lineWidth * currentScale());
  }

  void drawBezier(Point p0, Point p1, Point p2, Point p3, const Color &color,
                  double lineWidth) override {
    p0 = transform(p0);
    p1 = transform(p1);
    p2 = transform(p2);
    p3 = transform(p3);
    int steps = 32;
    Point prev = p0;
    double lw = lineWidth * currentScale();
    for (int i = 1; i <= steps; i++) {
      double t = (double)i / steps;
      double u = 1 - t;
      Point cur;
      cur.x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x +
              t * t * t * p3.x;
      cur.y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y +
              t * t * t * p3.y;
      drawLineRaw(prev, cur, color, lw);
      prev = cur;
    }
  }

  void drawPetal(Point center, double rx, double ry, double rotation,
                 const Color &fill, const Color &stroke,
                 double lineWidth) override {
    // Approximate ellipse as polygon
    center = transform(center);
    double s = currentScale();
    rx *= s;
    ry *= s;
    int segments = 24;
    std::vector<Point> pts;
    for (int i = 0; i < segments; i++) {
      double a = 2.0 * PI * i / segments;
      double px =
          center.x + rx * cos(a) * cos(rotation) - ry * sin(a) * sin(rotation);
      double py =
          center.y + rx * cos(a) * sin(rotation) + ry * sin(a) * cos(rotation);
      pts.push_back({px, py});
    }
    fillPolygonRaw(pts, fill);
    if (lineWidth > 0 && stroke.a > 0) {
      for (size_t i = 0; i < pts.size(); i++) {
        size_t j = (i + 1) % pts.size();
        drawLineRaw(pts[i], pts[j], stroke, lineWidth * s);
      }
    }
  }

  void drawTileBackground(double x, double y, double size, const Color &bg,
                          bool selected = false,
                          bool highlighted = false) override {
    std::vector<Point> rect = {
        {x, y}, {x + size, y}, {x + size, y + size}, {x, y + size}};
    drawPolygon(rect, bg, {0, 0, 0, 0}, 0);
  }

  void drawTileBorder(double x, double y, double size, const Color &color,
                      double lineWidth) override {
    std::vector<Point> rect = {
        {x, y}, {x + size, y}, {x + size, y + size}, {x, y + size}};
    drawPolygon(rect, {0, 0, 0, 0}, color, lineWidth);
  }

  // ─── Transform Stack ─────────────────────────────────────────────────

  void save() override { transformStack.push_back(transformStack.back()); }
  void restore() override {
    if (transformStack.size() > 1)
      transformStack.pop_back();
  }

  void translate(double x, double y) override {
    auto &t = transformStack.back();
    t.tx += x * t.sx;
    t.ty += y * t.sy;
  }

  void rotate(double angle) override {
    transformStack.back().rotation += angle;
  }

  void scale(double sx, double sy) override {
    auto &t = transformStack.back();
    t.sx *= sx;
    t.sy *= sy;
  }

  void clear(double w, double h, const Color &bg) override {
    (void)w;
    (void)h;
    for (int i = 0; i < width * height; i++) {
      pixels[i * 4 + 0] = bg.r;
      pixels[i * 4 + 1] = bg.g;
      pixels[i * 4 + 2] = bg.b;
      pixels[i * 4 + 3] = (uint8_t)(bg.a * 255);
    }
  }

private:
  int width, height;
  std::vector<uint8_t> pixels;

  struct Transform {
    double tx, ty, sx, sy, rotation;
  };
  std::vector<Transform> transformStack;

  double currentScale() const {
    auto &t = transformStack.back();
    return (std::abs(t.sx) + std::abs(t.sy)) / 2.0;
  }

  Point transform(Point p) const {
    auto &t = transformStack.back();
    // Apply rotation around origin then scale+translate
    if (std::abs(t.rotation) > 1e-9) {
      double c = cos(t.rotation), s = sin(t.rotation);
      double rx = p.x * c - p.y * s;
      double ry = p.x * s + p.y * c;
      return {rx * t.sx + t.tx, ry * t.sy + t.ty};
    }
    return {p.x * t.sx + t.tx, p.y * t.sy + t.ty};
  }

  void blendPixel(int x, int y, const Color &c) {
    if (x < 0 || x >= width || y < 0 || y >= height)
      return;
    int idx = (y * width + x) * 4;
    double sa = c.a;
    double da = pixels[idx + 3] / 255.0;
    double outA = sa + da * (1 - sa);
    if (outA > 0) {
      pixels[idx + 0] =
          (uint8_t)((c.r * sa + pixels[idx + 0] * da * (1 - sa)) / outA);
      pixels[idx + 1] =
          (uint8_t)((c.g * sa + pixels[idx + 1] * da * (1 - sa)) / outA);
      pixels[idx + 2] =
          (uint8_t)((c.b * sa + pixels[idx + 2] * da * (1 - sa)) / outA);
      pixels[idx + 3] = (uint8_t)(outA * 255);
    }
  }

  // Scanline polygon fill
  void fillPolygonRaw(const std::vector<Point> &pts, const Color &fill) {
    if (pts.size() < 3 || fill.a <= 0)
      return;
    double minY = 1e9, maxY = -1e9;
    for (auto &p : pts) {
      minY = std::min(minY, p.y);
      maxY = std::max(maxY, p.y);
    }
    int iy0 = std::max(0, (int)minY);
    int iy1 = std::min(height - 1, (int)maxY);

    for (int y = iy0; y <= iy1; y++) {
      std::vector<double> intersections;
      for (size_t i = 0; i < pts.size(); i++) {
        size_t j = (i + 1) % pts.size();
        double y0 = pts[i].y, y1 = pts[j].y;
        if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
          double t = (y - y0) / (y1 - y0);
          intersections.push_back(pts[i].x + t * (pts[j].x - pts[i].x));
        }
      }
      std::sort(intersections.begin(), intersections.end());
      for (size_t k = 0; k + 1 < intersections.size(); k += 2) {
        int x0 = std::max(0, (int)intersections[k]);
        int x1 = std::min(width - 1, (int)intersections[k + 1]);
        for (int x = x0; x <= x1; x++)
          blendPixel(x, y, fill);
      }
    }
  }

  // Bresenham-ish thick line
  void drawLineRaw(Point from, Point to, const Color &color, double lw) {
    double dx = to.x - from.x;
    double dy = to.y - from.y;
    double len = sqrt(dx * dx + dy * dy);
    if (len < 0.5) {
      blendPixel((int)from.x, (int)from.y, color);
      return;
    }
    int steps = (int)(len * 2);
    double halfW = lw / 2.0;
    for (int i = 0; i <= steps; i++) {
      double t = (double)i / steps;
      double cx = from.x + dx * t;
      double cy = from.y + dy * t;
      int x0 = std::max(0, (int)(cx - halfW));
      int y0 = std::max(0, (int)(cy - halfW));
      int x1 = std::min(width - 1, (int)(cx + halfW));
      int y1 = std::min(height - 1, (int)(cy + halfW));
      for (int y = y0; y <= y1; y++)
        for (int x = x0; x <= x1; x++)
          if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= halfW * halfW)
            blendPixel(x, y, color);
    }
  }
};

// ─── Main ───────────────────────────────────────────────────────────────────

int main(int argc, char *argv[]) {
  int imageSize = 512;
  const char *outputPath = "gachbong-icon.png";

  if (argc > 1)
    outputPath = argv[1];
  if (argc > 2)
    imageSize = atoi(argv[2]);

  printf("🎨 Gạch Bông Avatar Exporter\n");
  printf("   Output: %s (%dx%d)\n\n", outputPath, imageSize, imageSize);

  SoftwareRenderer renderer(imageSize, imageSize);

  // Background: warm cream
  renderer.clear(imageSize, imageSize, Color(245, 238, 225));

  // Render a 2×2 grid of featured patterns
  // Showcasing the diversity of Vietnamese tile art
  struct TileConfig {
    PatternType type;
    int paletteIdx;
  };

  TileConfig tiles[] = {
      {PatternType::HOA_CHANH, 0}, // Hoa Chanh — Gạch Cũ Sài Gòn palette
      {PatternType::CANH_QUAT, 3}, // Cánh Quạt — Hoàng Cung palette
      {PatternType::HOA_SEN, 2},   // Hoa Sen — Đồng Bằng palette
      {PatternType::BAT_GIAC, 1},  // Bát Giác — Xưa Huế palette
  };

  double margin = imageSize * 0.04;
  double gap = imageSize * 0.02;
  double tileSize = (imageSize - 2 * margin - gap) / 2.0;

  RenderOptions opts;
  opts.borderWidth = 2.0;
  opts.showBorder = true;
  opts.padding = 0.05;

  for (int row = 0; row < 2; row++) {
    for (int col = 0; col < 2; col++) {
      int idx = row * 2 + col;
      double x = margin + col * (tileSize + gap);
      double y = margin + row * (tileSize + gap);
      double cx = x + tileSize / 2.0;
      double cy = y + tileSize / 2.0;

      auto &tile = tiles[idx];
      auto &palette = PALETTES[tile.paletteIdx];

      // Draw tile background
      renderer.drawTileBackground(x, y, tileSize, palette.background, false,
                                  false);

      // Render pattern
      renderPattern(renderer, tile.type, palette, cx, cy, tileSize, opts);

      // Draw tile border
      renderer.drawTileBorder(x, y, tileSize, Color(100, 80, 60, 0.4), 2);
    }
  }

  // Write PNG
  int result = stbi_write_png(outputPath, imageSize, imageSize, 4,
                              renderer.data(), imageSize * 4);

  if (result) {
    printf("✅ Exported: %s\n", outputPath);
  } else {
    printf("❌ Failed to write PNG\n");
    return 1;
  }

  return 0;
}
