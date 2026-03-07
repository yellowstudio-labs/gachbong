#include "traditional_floral.h"
#include "pattern_helpers.h"
#include <cmath>

namespace gachbong {
namespace patterns {

// ===== 1. HOA SEN — Lotus: 4-fold petal symmetry, edge arcs connect =====
void renderHoaSen(IRenderer &r, const Palette &p, double cx, double cy,
                  double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double corners[][2] = {
      {cx - h, cy - h}, {cx + h, cy - h}, {cx + h, cy + h}, {cx - h, cy + h}};
  for (int i = 0; i < 4; i++) {
    double startA = i * M_PI / 2.0;
    r.drawArc({corners[i][0], corners[i][1]}, h * 0.35, startA,
              startA + M_PI / 2.0, p.primary);
  }

  for (int i = 0; i < 4; i++) {
    double angle = i * M_PI / 2.0;
    r.drawPetal({cx + cos(angle) * h * 0.42, cy + sin(angle) * h * 0.42},
                h * 0.40, h * 0.18, angle, p.secondary);
  }

  for (int i = 0; i < 4; i++) {
    double angle = i * M_PI / 2.0 + M_PI / 4.0;
    r.drawPetal({cx + cos(angle) * h * 0.30, cy + sin(angle) * h * 0.30},
                h * 0.28, h * 0.12, angle, p.accent);
  }

  r.drawCircle({cx, cy}, h * 0.18, p.primary);
  r.drawCircle({cx, cy}, h * 0.09, p.accent);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

// ===== 2. BÔNG MAI — Plum blossom =====
void renderBongMai(IRenderer &r, const Palette &p, double cx, double cy,
                   double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double edges[][2] = {{cx, cy - h}, {cx + h, cy}, {cx, cy + h}, {cx - h, cy}};
  for (int i = 0; i < 4; i++) {
    double startA = (i + 0.5) * M_PI / 2.0 + M_PI / 2.0;
    r.drawArc({edges[i][0], edges[i][1]}, h * 0.22, startA, startA + M_PI,
              p.primary);
  }

  for (int i = 0; i < 5; i++) {
    double angle = i * 2.0 * M_PI / 5.0 - M_PI / 2.0;
    r.drawCircle({cx + cos(angle) * h * 0.32, cy + sin(angle) * h * 0.32},
                 h * 0.20, p.secondary);
  }

  r.drawCircle({cx, cy}, h * 0.16, p.accent);
  r.drawCircle({cx, cy}, h * 0.08, p.detail);

  for (int i = 0; i < 4; i++) {
    double dx = (i % 2 == 0 ? -1 : 1) * h * 0.72;
    double dy = (i < 2 ? -1 : 1) * h * 0.72;
    r.drawCircle({cx + dx, cy + dy}, h * 0.08, p.primary);
  }
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

// ===== 3. BÔNG CÚC — Chrysanthemum =====
void renderBongCuc(IRenderer &r, const Palette &p, double cx, double cy,
                   double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  for (int i = 0; i < 8; i++) {
    double angle = i * M_PI / 4.0;
    double tipX = cx + cos(angle) * h * 0.88;
    double tipY = cy + sin(angle) * h * 0.88;
    double perpAngle = angle + M_PI / 2.0;
    double baseW = h * 0.16;
    std::vector<Point> petal = {
        {cx + cos(perpAngle) * baseW, cy + sin(perpAngle) * baseW},
        {tipX, tipY},
        {cx - cos(perpAngle) * baseW, cy - sin(perpAngle) * baseW}};
    r.drawPolygon(petal, (i % 2 == 0) ? p.primary : p.secondary, p.detail, 0.8);
  }

  r.drawCircle({cx, cy}, h * 0.25, p.accent);
  r.drawCircle({cx, cy}, h * 0.15, p.background);
  r.drawCircle({cx, cy}, h * 0.08, p.primary);

  for (int i = 0; i < 8; i++) {
    double angle = i * M_PI / 4.0 + M_PI / 8.0;
    r.drawCircle({cx + cos(angle) * h * 0.55, cy + sin(angle) * h * 0.55},
                 h * 0.05, p.accent);
  }
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

// ===== 4. HOA THỊ — Cross-star flower =====
void renderHoaThi(IRenderer &r, const Palette &p, double cx, double cy,
                  double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double w = h * 0.30;
  r.drawPolygon({{cx - w, cy - h * 0.85},
                 {cx + w, cy - h * 0.85},
                 {cx + w, cy + h * 0.85},
                 {cx - w, cy + h * 0.85}},
                p.primary);
  r.drawPolygon({{cx - h * 0.85, cy - w},
                 {cx + h * 0.85, cy - w},
                 {cx + h * 0.85, cy + w},
                 {cx - h * 0.85, cy + w}},
                p.primary);

  double edgeDist = h * 0.60;
  r.drawCircle({cx, cy - edgeDist}, h * 0.32, p.secondary);
  r.drawCircle({cx, cy + edgeDist}, h * 0.32, p.secondary);
  r.drawCircle({cx - edgeDist, cy}, h * 0.32, p.secondary);
  r.drawCircle({cx + edgeDist, cy}, h * 0.32, p.secondary);

  double cs = h * 0.30;
  for (int i = 0; i < 4; i++) {
    double dx = (i % 2 == 0 ? -1 : 1) * (h - cs * 0.5);
    double dy = (i < 2 ? -1 : 1) * (h - cs * 0.5);
    std::vector<Point> sq = {{cx + dx - cs * 0.5, cy + dy - cs * 0.5},
                             {cx + dx + cs * 0.5, cy + dy - cs * 0.5},
                             {cx + dx + cs * 0.5, cy + dy + cs * 0.5},
                             {cx + dx - cs * 0.5, cy + dy + cs * 0.5}};
    r.drawPolygon(sq, p.accent);
  }

  r.drawCircle({cx, cy}, h * 0.22, p.accent);
  r.drawCircle({cx, cy}, h * 0.12, p.background);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

// ===== 5. HOA CHANH — Lemon blossom =====
void renderHoaChanh(IRenderer &r, const Palette &p, double cx, double cy,
                    double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double outR = h * 0.82;
  std::vector<Point> sq1 = {
      {cx, cy - outR}, {cx + outR, cy}, {cx, cy + outR}, {cx - outR, cy}};
  r.drawPolygon(sq1, p.primary, p.detail, 1.0);

  double diag = outR * 0.72;
  std::vector<Point> sq2 = {{cx - diag, cy - diag},
                            {cx + diag, cy - diag},
                            {cx + diag, cy + diag},
                            {cx - diag, cy + diag}};
  r.drawPolygon(sq2, p.secondary, p.detail, 1.0);

  auto star = starPolygon({cx, cy}, h * 0.45, h * 0.25, 8, M_PI / 8.0);
  r.drawPolygon(star, p.accent, p.detail, 1.0);

  r.drawCircle({cx, cy}, h * 0.18, p.background);
  r.drawCircle({cx, cy}, h * 0.10, p.primary);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

// ===== 6. HOA CÚC ĐẠI — Large chrysanthemum =====
void renderHoaCucDai(IRenderer &r, const Palette &p, double cx, double cy,
                     double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  for (int i = 0; i < 12; i++) {
    double angle = i * M_PI / 6.0;
    r.drawPetal({cx + cos(angle) * h * 0.38, cy + sin(angle) * h * 0.38},
                h * 0.40, h * 0.12, angle,
                (i % 3 == 0)   ? p.primary
                : (i % 3 == 1) ? p.secondary
                               : p.accent);
  }

  for (int i = 0; i < 4; i++) {
    double angle = i * M_PI / 2.0;
    r.drawCircle({cx + cos(angle) * h * 0.88, cy + sin(angle) * h * 0.88},
                 h * 0.10, p.primary);
  }

  r.drawCircle({cx, cy}, h * 0.22, p.detail);
  r.drawCircle({cx, cy}, h * 0.14, p.accent);
  r.drawCircle({cx, cy}, h * 0.07, p.background);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

// ===== 7. LÁ SEN — Lotus leaves =====
void renderLaSen(IRenderer &r, const Palette &p, double cx, double cy,
                 double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  for (int i = 0; i < 4; i++) {
    double angle = i * M_PI / 2.0;
    double px = cx + cos(angle) * h * 0.30;
    double py = cy + sin(angle) * h * 0.30;
    r.drawPetal({px, py}, h * 0.58, h * 0.28, angle, p.primary);
    r.drawLine({cx + cos(angle) * h * 0.05, cy + sin(angle) * h * 0.05},
               {cx + cos(angle) * h * 0.75, cy + sin(angle) * h * 0.75},
               p.detail, 1.0);
  }

  for (int i = 0; i < 4; i++) {
    double angle = i * M_PI / 2.0 + M_PI / 4.0;
    r.drawPetal({cx + cos(angle) * h * 0.40, cy + sin(angle) * h * 0.40},
                h * 0.22, h * 0.10, angle, p.secondary);
  }

  r.drawCircle({cx, cy}, h * 0.15, p.accent);
  r.drawCircle({cx, cy}, h * 0.07, p.primary);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

} // namespace patterns
} // namespace gachbong
