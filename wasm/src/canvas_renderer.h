#pragma once
#include <emscripten/val.h>
#include <gachbong/renderer.h>

namespace gachbong {

/// Concrete renderer implementation using HTML5 Canvas 2D API via Emscripten.
/// This is the web-specific renderer used by the WASM build.
class CanvasRenderer : public IRenderer {
public:
  void setContext(emscripten::val ctx);

  // IRenderer implementation
  void clear(double width, double height, const Color &bg) override;

  void drawCircle(Point center, double radius, const Color &fill,
                  const Color &stroke = {0, 0, 0, 0},
                  double lineWidth = 0) override;

  void drawArc(Point center, double radius, double startAngle, double endAngle,
               const Color &fill, const Color &stroke = {0, 0, 0, 0},
               double lineWidth = 0) override;

  void drawPolygon(const std::vector<Point> &points, const Color &fill,
                   const Color &stroke = {0, 0, 0, 0},
                   double lineWidth = 0) override;

  void drawLine(Point from, Point to, const Color &color,
                double lineWidth = 2) override;

  void drawBezier(Point p0, Point p1, Point p2, Point p3, const Color &color,
                  double lineWidth = 2) override;

  void drawPetal(Point center, double rx, double ry, double rotation,
                 const Color &fill, const Color &stroke = {0, 0, 0, 0},
                 double lineWidth = 0) override;

  void drawTileBackground(double x, double y, double size, const Color &bg,
                          bool selected = false,
                          bool highlighted = false) override;

  void drawTileBorder(double x, double y, double size, const Color &color,
                      double lineWidth = 2) override;

  void save() override;
  void restore() override;
  void translate(double x, double y) override;
  void rotate(double angle) override;
  void scale(double sx, double sy) override;

  // Effect overrides (Canvas2D implementations)
  void drawRoundedRect(double x, double y, double w, double h, double radius,
                       const Color &fill, const Color &stroke = {0, 0, 0, 0},
                       double lineWidth = 0) override;
  void applyTextureOverlay(double x, double y, double w, double h,
                           double intensity, unsigned int seed) override;
  void applyWearEffect(double x, double y, double w, double h, double amount,
                       unsigned int seed) override;
  void drawGradientRect(double x, double y, double w, double h,
                        const Color &color1, const Color &color2,
                        bool vertical = true) override;
  void clipRect(double x, double y, double w, double h) override;
  void resetClip() override;
  void setOpacity(double alpha) override;

private:
  emscripten::val ctx_ = emscripten::val::null();
};

} // namespace gachbong
