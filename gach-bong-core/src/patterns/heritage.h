#pragma once
#include <gachbong/patterns.h>

namespace gachbong {
namespace patterns {

void renderHoiVan(IRenderer &r, const Palette &p, double cx, double cy,
                  double s);
void renderGachTau(IRenderer &r, const Palette &p, double cx, double cy,
                   double s);

} // namespace patterns
} // namespace gachbong
