#include "pattern_helpers.h"

namespace gachbong {
namespace patterns {

void fillTileSquare(IRenderer &r, double cx, double cy, double s,
                    const Color &bgCol) {
  double h = s * 0.5;
  double pad = s * 0.04;
  std::vector<Point> sq = {{cx - h + pad, cy - h + pad},
                           {cx + h - pad, cy - h + pad},
                           {cx + h - pad, cy + h - pad},
                           {cx - h + pad, cy + h - pad}};
  r.drawPolygon(sq, bgCol);
}

void strokeTileSquare(IRenderer &r, double cx, double cy, double s,
                      const Color &col, double lw) {
  double h = s * 0.5;
  double pad = s * 0.04;
  std::vector<Point> sq = {{cx - h + pad, cy - h + pad},
                           {cx + h - pad, cy - h + pad},
                           {cx + h - pad, cy + h - pad},
                           {cx - h + pad, cy + h - pad}};
  r.drawPolygon(sq, Color(0, 0, 0, 0), col, lw);
}

} // namespace patterns
} // namespace gachbong
