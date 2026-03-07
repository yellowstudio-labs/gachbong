#include "canvas_renderer.h"

namespace gachbong {

void CanvasRenderer::setContext(emscripten::val ctx) { ctx_ = ctx; }

void CanvasRenderer::clear(double width, double height, const Color &bg) {
  ctx_.call<void>("clearRect", 0.0, 0.0, width, height);
  ctx_.set("fillStyle", bg.toRGBA());
  ctx_.call<void>("fillRect", 0.0, 0.0, width, height);
}

void CanvasRenderer::drawCircle(Point center, double radius, const Color &fill,
                                const Color &stroke, double lineWidth) {
  ctx_.call<void>("beginPath");
  ctx_.call<void>("arc", center.x, center.y, radius, 0.0, 2 * PI);
  ctx_.call<void>("closePath");

  if (fill.a > 0) {
    ctx_.set("fillStyle", fill.toRGBA());
    ctx_.call<void>("fill");
  }
  if (stroke.a > 0 && lineWidth > 0) {
    ctx_.set("strokeStyle", stroke.toRGBA());
    ctx_.set("lineWidth", lineWidth);
    ctx_.call<void>("stroke");
  }
}

void CanvasRenderer::drawArc(Point center, double radius, double startAngle,
                             double endAngle, const Color &fill,
                             const Color &stroke, double lineWidth) {
  ctx_.call<void>("beginPath");
  ctx_.call<void>("moveTo", center.x, center.y);
  ctx_.call<void>("arc", center.x, center.y, radius, startAngle, endAngle);
  ctx_.call<void>("closePath");

  if (fill.a > 0) {
    ctx_.set("fillStyle", fill.toRGBA());
    ctx_.call<void>("fill");
  }
  if (stroke.a > 0 && lineWidth > 0) {
    ctx_.set("strokeStyle", stroke.toRGBA());
    ctx_.set("lineWidth", lineWidth);
    ctx_.call<void>("stroke");
  }
}

void CanvasRenderer::drawPolygon(const std::vector<Point> &points,
                                 const Color &fill, const Color &stroke,
                                 double lineWidth) {
  if (points.empty())
    return;

  ctx_.call<void>("beginPath");
  ctx_.call<void>("moveTo", points[0].x, points[0].y);
  for (size_t i = 1; i < points.size(); i++) {
    ctx_.call<void>("lineTo", points[i].x, points[i].y);
  }
  ctx_.call<void>("closePath");

  if (fill.a > 0) {
    ctx_.set("fillStyle", fill.toRGBA());
    ctx_.call<void>("fill");
  }
  if (stroke.a > 0 && lineWidth > 0) {
    ctx_.set("strokeStyle", stroke.toRGBA());
    ctx_.set("lineWidth", lineWidth);
    ctx_.call<void>("stroke");
  }
}

void CanvasRenderer::drawLine(Point from, Point to, const Color &color,
                              double lineWidth) {
  ctx_.call<void>("beginPath");
  ctx_.call<void>("moveTo", from.x, from.y);
  ctx_.call<void>("lineTo", to.x, to.y);
  ctx_.set("strokeStyle", color.toRGBA());
  ctx_.set("lineWidth", lineWidth);
  ctx_.call<void>("stroke");
}

void CanvasRenderer::drawBezier(Point p0, Point p1, Point p2, Point p3,
                                const Color &color, double lineWidth) {
  ctx_.call<void>("beginPath");
  ctx_.call<void>("moveTo", p0.x, p0.y);
  ctx_.call<void>("bezierCurveTo", p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  ctx_.set("strokeStyle", color.toRGBA());
  ctx_.set("lineWidth", lineWidth);
  ctx_.call<void>("stroke");
}

void CanvasRenderer::drawPetal(Point center, double rx, double ry,
                               double rotation, const Color &fill,
                               const Color &stroke, double lineWidth) {
  save();
  translate(center.x, center.y);
  rotate(rotation);

  ctx_.call<void>("beginPath");
  ctx_.call<void>("ellipse", 0.0, 0.0, rx, ry, 0.0, 0.0, 2 * PI);
  ctx_.call<void>("closePath");

  if (fill.a > 0) {
    ctx_.set("fillStyle", fill.toRGBA());
    ctx_.call<void>("fill");
  }
  if (stroke.a > 0 && lineWidth > 0) {
    ctx_.set("strokeStyle", stroke.toRGBA());
    ctx_.set("lineWidth", lineWidth);
    ctx_.call<void>("stroke");
  }

  restore();
}

void CanvasRenderer::drawTileBackground(double x, double y, double size,
                                        const Color &bg, bool selected,
                                        bool highlighted) {
  double radius = 6.0;
  double padding = 2.0;

  ctx_.set("shadowColor", std::string("rgba(0,0,0,0.3)"));
  ctx_.set("shadowBlur", 8.0);
  ctx_.set("shadowOffsetX", 2.0);
  ctx_.set("shadowOffsetY", 2.0);

  double rx = x + padding;
  double ry = y + padding;
  double w = size - padding * 2;
  double h = size - padding * 2;

  ctx_.call<void>("beginPath");
  ctx_.call<void>("roundRect", rx, ry, w, h, radius);
  ctx_.call<void>("closePath");

  ctx_.set("fillStyle", bg.toRGBA());
  ctx_.call<void>("fill");

  ctx_.set("shadowColor", std::string("transparent"));
  ctx_.set("shadowBlur", 0.0);

  if (selected) {
    ctx_.set("strokeStyle", std::string("rgba(255,215,0,1.0)"));
    ctx_.set("lineWidth", 4.0);
    ctx_.set("shadowColor", std::string("rgba(255,215,0,0.8)"));
    ctx_.set("shadowBlur", 10.0);
    ctx_.call<void>("stroke");
    ctx_.set("shadowColor", std::string("transparent"));
    ctx_.set("shadowBlur", 0.0);
  } else if (highlighted) {
    ctx_.set("strokeStyle", std::string("rgba(255,0,128,1.0)"));
    ctx_.set("lineWidth", 5.0);
    ctx_.set("shadowColor", std::string("rgba(255,0,128,0.8)"));
    ctx_.set("shadowBlur", 15.0);
    ctx_.call<void>("stroke");
    ctx_.set("shadowColor", std::string("transparent"));
    ctx_.set("shadowBlur", 0.0);
  }
}

void CanvasRenderer::drawTileBorder(double x, double y, double size,
                                    const Color &color, double lineWidth) {
  double radius = 6.0;
  double padding = 2.0;
  ctx_.call<void>("beginPath");
  ctx_.call<void>("roundRect", x + padding, y + padding, size - padding * 2,
                  size - padding * 2, radius);
  ctx_.set("strokeStyle", color.toRGBA());
  ctx_.set("lineWidth", lineWidth);
  ctx_.call<void>("stroke");
}

void CanvasRenderer::save() { ctx_.call<void>("save"); }
void CanvasRenderer::restore() { ctx_.call<void>("restore"); }
void CanvasRenderer::translate(double x, double y) {
  ctx_.call<void>("translate", x, y);
}
void CanvasRenderer::rotate(double angle) { ctx_.call<void>("rotate", angle); }
void CanvasRenderer::scale(double sx, double sy) {
  ctx_.call<void>("scale", sx, sy);
}

// ========== Effect Implementations (Canvas2D) ==========

void CanvasRenderer::drawRoundedRect(double x, double y, double w, double h,
                                     double radius, const Color &fill,
                                     const Color &stroke, double lineWidth) {
  ctx_.call<void>("beginPath");
  ctx_.call<void>("roundRect", x, y, w, h, radius);
  ctx_.call<void>("closePath");

  if (fill.a > 0) {
    ctx_.set("fillStyle", fill.toRGBA());
    ctx_.call<void>("fill");
  }
  if (stroke.a > 0 && lineWidth > 0) {
    ctx_.set("strokeStyle", stroke.toRGBA());
    ctx_.set("lineWidth", lineWidth);
    ctx_.call<void>("stroke");
  }
}

void CanvasRenderer::applyTextureOverlay(double x, double y, double w, double h,
                                         double intensity, unsigned int seed) {
  // Use Canvas2D compositing to add procedural cement grain texture
  save();

  // Simple seeded pseudo-random for deterministic noise
  auto nextRand = [&seed]() -> double {
    seed = seed * 1103515245 + 12345;
    return ((seed >> 16) & 0x7FFF) / 32767.0;
  };

  ctx_.set("globalAlpha", intensity * 0.6);

  // Draw scattered noise dots to simulate cement grain
  int dotCount = static_cast<int>(w * h / 18.0);
  dotCount = std::min(dotCount, 3000); // cap for performance

  for (int i = 0; i < dotCount; i++) {
    double dx = x + nextRand() * w;
    double dy = y + nextRand() * h;
    double dotSize = 0.5 + nextRand() * 1.2;
    int gray = 80 + static_cast<int>(nextRand() * 100);
    double alpha = 0.05 + nextRand() * 0.12;

    ctx_.set("fillStyle", std::string("rgba(") + std::to_string(gray) + "," +
                              std::to_string(gray) + "," +
                              std::to_string(gray) + "," +
                              std::to_string(alpha) + ")");
    ctx_.call<void>("fillRect", dx, dy, dotSize, dotSize);
  }

  // Add a few larger grain clusters
  int clusterCount = static_cast<int>(w * h / 500.0);
  clusterCount = std::min(clusterCount, 50);
  ctx_.set("globalAlpha", intensity * 0.3);

  for (int i = 0; i < clusterCount; i++) {
    double dx = x + nextRand() * w;
    double dy = y + nextRand() * h;
    double clusterSize = 1.5 + nextRand() * 3.0;
    int gray = 60 + static_cast<int>(nextRand() * 80);

    ctx_.call<void>("beginPath");
    ctx_.call<void>("arc", dx, dy, clusterSize, 0.0, 2 * PI);
    ctx_.set("fillStyle", std::string("rgba(") + std::to_string(gray) + "," +
                              std::to_string(gray) + "," +
                              std::to_string(gray) + ",0.08)");
    ctx_.call<void>("fill");
  }

  ctx_.set("globalAlpha", 1.0);
  restore();
}

void CanvasRenderer::applyWearEffect(double x, double y, double w, double h,
                                     double amount, unsigned int seed) {
  save();

  auto nextRand = [&seed]() -> double {
    seed = seed * 1103515245 + 12345;
    return ((seed >> 16) & 0x7FFF) / 32767.0;
  };

  // Wear spots — semi-transparent light/dark patches
  int spotCount = static_cast<int>(amount * 25);
  for (int i = 0; i < spotCount; i++) {
    double sx = x + nextRand() * w;
    double sy = y + nextRand() * h;
    double sr = 2.0 + nextRand() * (w * 0.08);
    bool isLight = nextRand() > 0.5;
    double spotAlpha = 0.03 + nextRand() * amount * 0.12;

    ctx_.set("globalAlpha", spotAlpha);
    ctx_.call<void>("beginPath");
    ctx_.call<void>("arc", sx, sy, sr, 0.0, 2 * PI);

    if (isLight) {
      ctx_.set("fillStyle", std::string("rgba(255,255,240,1)"));
    } else {
      ctx_.set("fillStyle", std::string("rgba(40,35,30,1)"));
    }
    ctx_.call<void>("fill");
  }

  // Edge darkening (dirt accumulates at edges)
  double edgeSize = w * 0.06 * amount;
  ctx_.set("globalAlpha", amount * 0.15);
  ctx_.set("fillStyle", std::string("rgba(50,40,35,1)"));

  // Top edge
  ctx_.call<void>("fillRect", x, y, w, edgeSize);
  // Bottom edge
  ctx_.call<void>("fillRect", x, y + h - edgeSize, w, edgeSize);
  // Left edge
  ctx_.call<void>("fillRect", x, y, edgeSize, h);
  // Right edge
  ctx_.call<void>("fillRect", x + w - edgeSize, y, edgeSize, h);

  // A few thin scratch lines
  int scratchCount = static_cast<int>(amount * 8);
  ctx_.set("globalAlpha", amount * 0.08);

  for (int i = 0; i < scratchCount; i++) {
    double sx1 = x + nextRand() * w;
    double sy1 = y + nextRand() * h;
    double angle = nextRand() * PI;
    double len = 3.0 + nextRand() * (w * 0.15);
    double sx2 = sx1 + std::cos(angle) * len;
    double sy2 = sy1 + std::sin(angle) * len;

    ctx_.call<void>("beginPath");
    ctx_.call<void>("moveTo", sx1, sy1);
    ctx_.call<void>("lineTo", sx2, sy2);
    ctx_.set("strokeStyle", std::string("rgba(80,70,60,1)"));
    ctx_.set("lineWidth", 0.5 + nextRand() * 0.8);
    ctx_.call<void>("stroke");
  }

  ctx_.set("globalAlpha", 1.0);
  restore();
}

void CanvasRenderer::drawGradientRect(double x, double y, double w, double h,
                                      const Color &color1, const Color &color2,
                                      bool vertical) {
  double x1 = x, y1 = y, x2 = x, y2 = y;
  if (vertical) {
    y2 = y + h;
  } else {
    x2 = x + w;
  }

  emscripten::val gradient =
      ctx_.call<emscripten::val>("createLinearGradient", x1, y1, x2, y2);
  gradient.call<void>("addColorStop", 0.0, color1.toRGBA());
  gradient.call<void>("addColorStop", 1.0, color2.toRGBA());

  ctx_.set("fillStyle", gradient);
  ctx_.call<void>("fillRect", x, y, w, h);
}

void CanvasRenderer::clipRect(double x, double y, double w, double h) {
  ctx_.call<void>("beginPath");
  ctx_.call<void>("rect", x, y, w, h);
  ctx_.call<void>("clip");
}

void CanvasRenderer::resetClip() {
  // Canvas2D doesn't have a direct resetClip — use save/restore instead
  // This is a no-op; callers should use save/restore pattern
}

void CanvasRenderer::setOpacity(double alpha) {
  ctx_.set("globalAlpha", alpha);
}

} // namespace gachbong
