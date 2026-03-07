#include "heritage.h"
#include "pattern_helpers.h"
#include <cmath>

namespace gachbong {
namespace patterns {

void renderHoiVan(IRenderer &r, const Palette &p, double cx, double cy,
                  double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double sizes[] = {0.88, 0.68, 0.48, 0.28};
  Color colors[] = {p.primary, p.background, p.secondary, p.accent};

  for (int i = 0; i < 4; i++) {
    double sz = h * sizes[i];
    r.drawPolygon({{cx - sz, cy - sz},
                   {cx + sz, cy - sz},
                   {cx + sz, cy + sz},
                   {cx - sz, cy + sz}},
                  colors[i], p.detail, 1.2);
  }

  double step = h * 0.10;
  for (int side = 0; side < 4; side++) {
    double angle = side * M_PI / 2.0;
    double ca = cos(angle), sa = sin(angle);
    for (int j = -1; j <= 1; j++) {
      double off = j * step * 3.0;
      double bx = cx + (ca * h * 0.88 - sa * off);
      double by = cy + (sa * h * 0.88 + ca * off);
      r.drawLine({bx, by}, {bx - ca * step * 2, by - sa * step * 2}, p.detail,
                 1.5);
    }
  }

  r.drawCircle({cx, cy}, h * 0.10, p.detail);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderGachTau(IRenderer &r, const Palette &p, double cx, double cy,
                   double s) {
  double h = s * 0.5;

  fillTileSquare(r, cx, cy, s, p.primary);

  double b1 = h * 0.85;
  r.drawPolygon({{cx - b1, cy - b1},
                 {cx + b1, cy - b1},
                 {cx + b1, cy + b1},
                 {cx - b1, cy + b1}},
                Color(0, 0, 0, 0), p.detail, 1.2);

  double b2 = h * 0.72;
  r.drawPolygon({{cx - b2, cy - b2},
                 {cx + b2, cy - b2},
                 {cx + b2, cy + b2},
                 {cx - b2, cy + b2}},
                Color(0, 0, 0, 0), p.detail, 0.8);

  r.drawLine({cx - b2, cy}, {cx + b2, cy}, p.secondary, 0.8);
  r.drawLine({cx, cy - b2}, {cx, cy + b2}, p.secondary, 0.8);

  double d = h * 0.25;
  r.drawPolygon({{cx, cy - d}, {cx + d, cy}, {cx, cy + d}, {cx - d, cy}},
                p.secondary, p.detail, 0.8);

  double cd = h * 0.60;
  for (int i = 0; i < 4; i++) {
    double dx = (i % 2 == 0 ? -1 : 1) * cd;
    double dy = (i < 2 ? -1 : 1) * cd;
    r.drawCircle({cx + dx, cy + dy}, h * 0.06, p.accent);
  }

  r.drawCircle({cx, cy}, h * 0.08, p.accent);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

} // namespace patterns
} // namespace gachbong
