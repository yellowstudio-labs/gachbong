#pragma once
#include <gachbong/patterns.h>

namespace gachbong {
namespace patterns {

void renderHoaSen(IRenderer &r, const Palette &p, double cx, double cy,
                  double s);
void renderBongMai(IRenderer &r, const Palette &p, double cx, double cy,
                   double s);
void renderBongCuc(IRenderer &r, const Palette &p, double cx, double cy,
                   double s);
void renderHoaThi(IRenderer &r, const Palette &p, double cx, double cy,
                  double s);
void renderHoaChanh(IRenderer &r, const Palette &p, double cx, double cy,
                    double s);
void renderHoaCucDai(IRenderer &r, const Palette &p, double cx, double cy,
                     double s);
void renderLaSen(IRenderer &r, const Palette &p, double cx, double cy,
                 double s);

} // namespace patterns
} // namespace gachbong
