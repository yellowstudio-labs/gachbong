#pragma once
#include <gachbong/patterns.h>

namespace gachbong {
namespace patterns {

void renderCanhQuat(IRenderer &r, const Palette &p, double cx, double cy,
                    double s);
void renderBatGiac(IRenderer &r, const Palette &p, double cx, double cy,
                   double s);
void renderKimCuong(IRenderer &r, const Palette &p, double cx, double cy,
                    double s);
void renderBanCo(IRenderer &r, const Palette &p, double cx, double cy,
                 double s);
void renderChongChong(IRenderer &r, const Palette &p, double cx, double cy,
                      double s);
void renderLucGiac(IRenderer &r, const Palette &p, double cx, double cy,
                   double s);
void renderDongTam(IRenderer &r, const Palette &p, double cx, double cy,
                   double s);

} // namespace patterns
} // namespace gachbong
