#pragma once
#include <gachbong/geometry.h>
#include <gachbong/renderer.h>

namespace gachbong {
namespace patterns {

// Fill full square tile background
void fillTileSquare(IRenderer &r, double cx, double cy, double s,
                    const Color &bgCol);

// Draw thin border around the square
void strokeTileSquare(IRenderer &r, double cx, double cy, double s,
                      const Color &col, double lw = 1.0);

} // namespace patterns
} // namespace gachbong
