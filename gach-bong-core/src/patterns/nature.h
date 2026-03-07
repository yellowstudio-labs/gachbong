#pragma once
#include <gachbong/patterns.h>

namespace gachbong {
namespace patterns {

void renderVayCa(IRenderer &r, const Palette &p, double cx, double cy,
                 double s);
void renderSongNuoc(IRenderer &r, const Palette &p, double cx, double cy,
                    double s);
void renderMayCuon(IRenderer &r, const Palette &p, double cx, double cy,
                   double s);
void renderDayLeo(IRenderer &r, const Palette &p, double cx, double cy,
                  double s);

} // namespace patterns
} // namespace gachbong
