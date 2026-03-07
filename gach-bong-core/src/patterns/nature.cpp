#include "nature.h"
#include "pattern_helpers.h"
#include <cmath>

namespace gachbong {
namespace patterns {

void renderVayCa(IRenderer &r, const Palette &p, double cx, double cy,
                 double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double scaleR = h * 0.38;
  Color scaleColors[] = {p.primary, p.secondary};

  for (int row = -1; row <= 2; row++) {
    for (int col = -1; col <= 2; col++) {
      double offsetX = (row % 2 != 0) ? scaleR : 0;
      double sx = cx - h + col * scaleR * 2.0 + offsetX;
      double sy = cy - h + row * scaleR * 1.3;
      int colorIdx = (row + col + 4) % 2;
      r.drawArc({sx, sy}, scaleR, M_PI, 2.0 * M_PI, scaleColors[colorIdx]);
      r.drawArc({sx, sy}, scaleR, M_PI, 2.0 * M_PI, Color(0, 0, 0, 0), p.detail,
                0.8);
    }
  }
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderSongNuoc(IRenderer &r, const Palette &p, double cx, double cy,
                    double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double waveH = h * 0.35;
  for (int row = -2; row <= 2; row++) {
    double baseY = cy + row * waveH;
    Color waveColor = (row % 2 == 0) ? p.primary : p.secondary;
    for (int col = -3; col <= 3; col++) {
      double waveX = cx + col * waveH;
      if ((col + row) % 2 == 0) {
        r.drawArc({waveX, baseY}, waveH * 0.5, M_PI, 2.0 * M_PI, waveColor);
      } else {
        r.drawArc({waveX, baseY}, waveH * 0.5, 0, M_PI, waveColor);
      }
    }
  }

  for (int i = -2; i <= 2; i++) {
    r.drawLine({cx - h, cy + i * waveH * 0.8}, {cx + h, cy + i * waveH * 0.8},
               p.detail, 0.5);
  }
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderMayCuon(IRenderer &r, const Palette &p, double cx, double cy,
                   double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  double corners[][2] = {
      {cx - h, cy - h}, {cx + h, cy - h}, {cx + h, cy + h}, {cx - h, cy + h}};
  double startAngles[] = {0, M_PI / 2.0, M_PI, 3.0 * M_PI / 2.0};

  for (int i = 0; i < 4; i++) {
    r.drawArc({corners[i][0], corners[i][1]}, h * 0.65, startAngles[i],
              startAngles[i] + M_PI / 2.0, p.primary);
    r.drawArc({corners[i][0], corners[i][1]}, h * 0.45, startAngles[i],
              startAngles[i] + M_PI / 2.0, p.background);
    r.drawArc({corners[i][0], corners[i][1]}, h * 0.30, startAngles[i],
              startAngles[i] + M_PI / 2.0, p.secondary);
    r.drawArc({corners[i][0], corners[i][1]}, h * 0.15, startAngles[i],
              startAngles[i] + M_PI / 2.0, p.background);
  }

  r.drawCircle({cx, cy}, h * 0.18, p.accent);
  r.drawCircle({cx, cy}, h * 0.09, p.detail);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

void renderDayLeo(IRenderer &r, const Palette &p, double cx, double cy,
                  double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  r.drawLine({cx - h, cy - h}, {cx + h, cy + h}, p.primary, h * 0.08);
  r.drawLine({cx + h, cy - h}, {cx - h, cy + h}, p.primary, h * 0.08);

  for (int i = 0; i < 4; i++) {
    double angle = i * M_PI / 2.0 + M_PI / 4.0;
    double dist = h * 0.45;
    double lx = cx + cos(angle) * dist;
    double ly = cy + sin(angle) * dist;
    r.drawPetal(
        {lx + cos(angle + 0.5) * h * 0.12, ly + sin(angle + 0.5) * h * 0.12},
        h * 0.18, h * 0.08, angle + 0.7, p.secondary);
    r.drawPetal(
        {lx + cos(angle - 0.5) * h * 0.12, ly + sin(angle - 0.5) * h * 0.12},
        h * 0.18, h * 0.08, angle - 0.7, p.secondary);
    r.drawCircle({lx, ly}, h * 0.06, p.accent);
  }

  for (int i = 0; i < 4; i++) {
    double angle = i * M_PI / 2.0;
    double ex = cx + cos(angle) * h * 0.85;
    double ey = cy + sin(angle) * h * 0.85;
    r.drawPetal({ex, ey}, h * 0.14, h * 0.06, angle + M_PI / 2.0, p.secondary);
  }

  r.drawCircle({cx, cy}, h * 0.14, p.primary);
  r.drawCircle({cx, cy}, h * 0.08, p.accent);
  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}

} // namespace patterns
} // namespace gachbong
