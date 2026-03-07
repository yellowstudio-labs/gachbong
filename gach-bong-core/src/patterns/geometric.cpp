#include "geometric.h"
#include "pattern_helpers.h"
#include <cmath>

namespace gachbong {
namespace patterns {

void renderCanhQuat(IRenderer &r, const Palette &p, double cx, double cy,
                    double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double corners[][2] = {
      {cx - h, cy - h}, {cx + h, cy - h}, {cx + h, cy + h}, {cx - h, cy + h}};
  double startAngles[] = {0, M_PI / 2.0, M_PI, 3.0 * M_PI / 2.0};

  for (int i = 0; i < 4; i++) {
    r.drawArc({corners[i][0], corners[i][1]}, h * 0.85, startAngles[i],
              startAngles[i] + M_PI / 2.0,
              (i % 2 == 0) ? p.primary : p.secondary);
    r.drawArc({corners[i][0], corners[i][1]}, h * 0.50, startAngles[i],
              startAngles[i] + M_PI / 2.0, p.background);
  }

  double d = h * 0.20;
  std::vector<Point> diamond = {
      {cx, cy - d}, {cx + d, cy}, {cx, cy + d}, {cx - d, cy}};
  r.drawPolygon(diamond, p.accent, p.detail, 1.0);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderBatGiac(IRenderer &r, const Palette &p, double cx, double cy,
                   double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.secondary);

  auto oct = regularPolygon({cx, cy}, h * 0.82, 8, M_PI / 8.0);
  r.drawPolygon(oct, p.background, p.detail, 1.5);

  auto innerOct = regularPolygon({cx, cy}, h * 0.55, 8, M_PI / 8.0);
  r.drawPolygon(innerOct, p.primary, p.detail, 1.0);

  auto star = starPolygon({cx, cy}, h * 0.48, h * 0.25, 8, M_PI / 8.0);
  r.drawPolygon(star, p.accent, p.detail, 1.0);

  r.drawCircle({cx, cy}, h * 0.14, p.background);
  r.drawCircle({cx, cy}, h * 0.07, p.detail);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderKimCuong(IRenderer &r, const Palette &p, double cx, double cy,
                    double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  r.drawPolygon({{cx - h, cy - h}, {cx, cy - h}, {cx - h, cy}}, p.secondary);
  r.drawPolygon({{cx + h, cy - h}, {cx, cy - h}, {cx + h, cy}}, p.secondary);
  r.drawPolygon({{cx + h, cy + h}, {cx, cy + h}, {cx + h, cy}}, p.secondary);
  r.drawPolygon({{cx - h, cy + h}, {cx, cy + h}, {cx - h, cy}}, p.secondary);

  double d1 = h * 0.88;
  r.drawPolygon({{cx, cy - d1}, {cx + d1, cy}, {cx, cy + d1}, {cx - d1, cy}},
                Color(0, 0, 0, 0), p.detail, 1.5);

  double d2 = h * 0.55;
  r.drawPolygon({{cx, cy - d2}, {cx + d2, cy}, {cx, cy + d2}, {cx - d2, cy}},
                p.primary, p.detail, 1.2);

  double d3 = h * 0.30;
  r.drawPolygon({{cx, cy - d3}, {cx + d3, cy}, {cx, cy + d3}, {cx - d3, cy}},
                p.accent, p.detail, 1.0);

  r.drawCircle({cx, cy}, h * 0.08, p.detail);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderBanCo(IRenderer &r, const Palette &p, double cx, double cy,
                 double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double cellSize = (h * 2.0 * 0.88) / 4.0;
  double startX = cx - cellSize * 2.0;
  double startY = cy - cellSize * 2.0;

  for (int row = 0; row < 4; row++) {
    for (int col = 0; col < 4; col++) {
      double cellX = startX + col * cellSize;
      double cellY = startY + row * cellSize;
      Color fillColor = ((row + col) % 2 == 0) ? p.primary : p.secondary;
      std::vector<Point> cell = {{cellX, cellY},
                                 {cellX + cellSize, cellY},
                                 {cellX + cellSize, cellY + cellSize},
                                 {cellX, cellY + cellSize}};
      r.drawPolygon(cell, fillColor, p.detail, 0.5);
    }
  }

  r.drawPolygon({{startX, startY},
                 {startX + cellSize * 4, startY},
                 {startX + cellSize * 4, startY + cellSize * 4},
                 {startX, startY + cellSize * 4}},
                Color(0, 0, 0, 0), p.detail, 1.5);

  double d = cellSize * 0.6;
  r.drawPolygon({{cx, cy - d}, {cx + d, cy}, {cx, cy + d}, {cx - d, cy}},
                p.accent, p.detail, 0.8);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderChongChong(IRenderer &r, const Palette &p, double cx, double cy,
                      double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  r.drawPolygon({{cx, cy}, {cx + h, cy - h}, {cx + h, cy}}, p.primary, p.detail,
                0.8);
  r.drawPolygon({{cx, cy}, {cx + h, cy}, {cx, cy + h}}, p.secondary, p.detail,
                0.8);
  r.drawPolygon({{cx, cy}, {cx, cy + h}, {cx - h, cy}}, p.primary, p.detail,
                0.8);
  r.drawPolygon({{cx, cy}, {cx - h, cy}, {cx, cy - h}}, p.secondary, p.detail,
                0.8);

  r.drawPolygon({{cx, cy - h}, {cx + h, cy - h}, {cx, cy}}, p.accent, p.detail,
                0.8);
  r.drawPolygon({{cx + h, cy}, {cx + h, cy + h}, {cx, cy}}, p.accent, p.detail,
                0.8);
  r.drawPolygon({{cx, cy + h}, {cx - h, cy + h}, {cx, cy}}, p.accent, p.detail,
                0.8);
  r.drawPolygon({{cx - h, cy}, {cx - h, cy - h}, {cx, cy}}, p.accent, p.detail,
                0.8);

  r.drawCircle({cx, cy}, h * 0.14, p.background);
  r.drawCircle({cx, cy}, h * 0.07, p.detail);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderLucGiac(IRenderer &r, const Palette &p, double cx, double cy,
                   double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.primary);

  double inner = h * 0.80;
  r.drawPolygon({{cx - inner, cy - inner},
                 {cx + inner, cy - inner},
                 {cx + inner, cy + inner},
                 {cx - inner, cy + inner}},
                p.background, p.detail, 1.0);

  auto triUp = regularPolygon({cx, cy}, h * 0.65, 3, -M_PI / 2.0);
  auto triDown = regularPolygon({cx, cy}, h * 0.65, 3, M_PI / 2.0);
  r.drawPolygon(triUp, p.secondary, p.detail, 1.0);
  r.drawPolygon(triDown, p.secondary, p.detail, 1.0);

  auto innerHex = regularPolygon({cx, cy}, h * 0.38, 6, M_PI / 6.0);
  r.drawPolygon(innerHex, p.accent, p.detail, 1.0);

  r.drawCircle({cx, cy}, h * 0.12, p.primary);

  for (int i = 0; i < 4; i++) {
    double dx = (i % 2 == 0 ? -1 : 1) * h * 0.72;
    double dy = (i < 2 ? -1 : 1) * h * 0.72;
    r.drawCircle({cx + dx, cy + dy}, h * 0.09, p.accent);
  }
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderDongTam(IRenderer &r, const Palette &p, double cx, double cy,
                   double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double radii[] = {0.88, 0.72, 0.56, 0.42, 0.28};
  Color colors[] = {p.primary, p.background, p.secondary, p.background,
                    p.accent};
  for (int i = 0; i < 5; i++) {
    r.drawCircle({cx, cy}, h * radii[i], colors[i], p.detail, 1.2);
  }

  r.drawLine({cx - h, cy}, {cx + h, cy}, p.detail, 1.0);
  r.drawLine({cx, cy - h}, {cx, cy + h}, p.detail, 1.0);
  r.drawLine({cx - h, cy - h}, {cx + h, cy + h}, p.detail, 0.6);
  r.drawLine({cx + h, cy - h}, {cx - h, cy + h}, p.detail, 0.6);

  r.drawCircle({cx, cy}, h * 0.10, p.detail);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

} // namespace patterns
} // namespace gachbong
