#pragma once
#include "geometry.h"
#include <vector>

namespace gachbong {

/// Abstract renderer interface for drawing tile patterns.
///
/// Platform-specific implementations should inherit from this class and
/// provide concrete rendering using the platform's graphics API:
///   - Web (WASM): Canvas 2D via Emscripten
///   - iOS: Core Graphics, Metal, or Skia
///   - Android: Canvas, OpenGL, Vulkan, or Skia
///   - Desktop: SDL, OpenGL, Skia, etc.
class IRenderer {
public:
  virtual ~IRenderer() = default;

  // ─── Primitive Drawing ───────────────────────────────────────────────

  /// Draw a filled/stroked circle
  virtual void drawCircle(Point center, double radius, const Color &fill,
                          const Color &stroke = {0, 0, 0, 0},
                          double lineWidth = 0) = 0;

  /// Draw a filled/stroked arc (pie slice)
  virtual void drawArc(Point center, double radius, double startAngle,
                       double endAngle, const Color &fill,
                       const Color &stroke = {0, 0, 0, 0},
                       double lineWidth = 0) = 0;

  /// Draw a filled/stroked polygon
  virtual void drawPolygon(const std::vector<Point> &points, const Color &fill,
                           const Color &stroke = {0, 0, 0, 0},
                           double lineWidth = 0) = 0;

  /// Draw a line segment
  virtual void drawLine(Point from, Point to, const Color &color,
                        double lineWidth = 2) = 0;

  /// Draw a cubic bezier curve
  virtual void drawBezier(Point p0, Point p1, Point p2, Point p3,
                          const Color &color, double lineWidth = 2) = 0;

  /// Draw an elliptical petal shape (rotated ellipse)
  virtual void drawPetal(Point center, double rx, double ry, double rotation,
                         const Color &fill, const Color &stroke = {0, 0, 0, 0},
                         double lineWidth = 0) = 0;

  // ─── Tile Rendering ──────────────────────────────────────────────────

  /// Draw tile background with optional selection/highlight state
  virtual void drawTileBackground(double x, double y, double size,
                                  const Color &bg, bool selected = false,
                                  bool highlighted = false) = 0;

  /// Draw tile border
  virtual void drawTileBorder(double x, double y, double size,
                              const Color &color, double lineWidth = 2) = 0;

  // ─── Transform Stack ─────────────────────────────────────────────────

  virtual void save() = 0;
  virtual void restore() = 0;
  virtual void translate(double x, double y) = 0;
  virtual void rotate(double angle) = 0;
  virtual void scale(double sx, double sy) = 0;

  // ─── Canvas Management ────────────────────────────────────────────────

  /// Clear the entire canvas with a background color
  virtual void clear(double width, double height, const Color &bg) = 0;

  // ─── Effects (optional overrides — default implementations provided) ──

  /// Draw a rounded rectangle
  virtual void drawRoundedRect(double x, double y, double w, double h,
                               double radius, const Color &fill,
                               const Color &stroke = {0, 0, 0, 0},
                               double lineWidth = 0) {
    // Default: draw regular rectangle via drawPolygon
    drawPolygon({{x, y}, {x + w, y}, {x + w, y + h}, {x, y + h}}, fill, stroke,
                lineWidth);
  }

  /// Apply a texture/noise overlay on the current area.
  /// Platform renderers override this for actual texture effects.
  virtual void applyTextureOverlay(double x, double y, double w, double h,
                                   double intensity, unsigned int seed) {
    (void)x;
    (void)y;
    (void)w;
    (void)h;
    (void)intensity;
    (void)seed;
  }

  /// Apply wear/aging effect on the current area.
  /// Platform renderers override this for actual wear marks.
  virtual void applyWearEffect(double x, double y, double w, double h,
                               double amount, unsigned int seed) {
    (void)x;
    (void)y;
    (void)w;
    (void)h;
    (void)amount;
    (void)seed;
  }

  /// Draw a linear gradient filled rectangle
  virtual void drawGradientRect(double x, double y, double w, double h,
                                const Color &color1, const Color &color2,
                                bool vertical = true) {
    // Default: fill with average color
    drawPolygon({{x, y}, {x + w, y}, {x + w, y + h}, {x, y + h}},
                Color::lerp(color1, color2, 0.5));
    (void)vertical;
  }

  /// Set clipping rectangle
  virtual void clipRect(double x, double y, double w, double h) {
    (void)x;
    (void)y;
    (void)w;
    (void)h;
  }

  /// Reset clipping
  virtual void resetClip() {}

  /// Set global opacity
  virtual void setOpacity(double alpha) { (void)alpha; }
};

} // namespace gachbong
