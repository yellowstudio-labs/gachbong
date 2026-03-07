#pragma once
#include <cmath>
#include <string>
#include <vector>

namespace gachbong {

constexpr double PI = 3.14159265358979323846;

struct Color {
  int r, g, b;
  double a;

  Color() : r(0), g(0), b(0), a(1.0) {}
  Color(int r, int g, int b, double a = 1.0) : r(r), g(g), b(b), a(a) {}

  std::string toRGBA() const {
    return "rgba(" + std::to_string(r) + "," + std::to_string(g) + "," +
           std::to_string(b) + "," + std::to_string(a) + ")";
  }

  Color withAlpha(double newAlpha) const { return Color(r, g, b, newAlpha); }

  static Color lerp(const Color &a, const Color &b, double t) {
    return Color((int)(a.r + (b.r - a.r) * t), (int)(a.g + (b.g - a.g) * t),
                 (int)(a.b + (b.b - a.b) * t), a.a + (b.a - a.a) * t);
  }
};

struct Point {
  double x, y;

  Point() : x(0), y(0) {}
  Point(double x, double y) : x(x), y(y) {}

  Point rotate(double angle, Point center = {0, 0}) const {
    double dx = x - center.x;
    double dy = y - center.y;
    double cosA = std::cos(angle);
    double sinA = std::sin(angle);
    return Point(center.x + dx * cosA - dy * sinA,
                 center.y + dx * sinA + dy * cosA);
  }

  Point scale(double sx, double sy, Point center = {0, 0}) const {
    return Point(center.x + (x - center.x) * sx,
                 center.y + (y - center.y) * sy);
  }

  Point mirror(bool horizontal, bool vertical, Point center = {0, 0}) const {
    return Point(horizontal ? (2 * center.x - x) : x,
                 vertical ? (2 * center.y - y) : y);
  }

  double distanceTo(const Point &other) const {
    double dx = x - other.x;
    double dy = y - other.y;
    return std::sqrt(dx * dx + dy * dy);
  }

  Point operator+(const Point &o) const { return {x + o.x, y + o.y}; }
  Point operator-(const Point &o) const { return {x - o.x, y - o.y}; }
  Point operator*(double s) const { return {x * s, y * s}; }
};

// Generate regular polygon points
inline std::vector<Point> regularPolygon(Point center, double radius, int sides,
                                         double startAngle = -PI / 2) {
  std::vector<Point> pts;
  for (int i = 0; i < sides; i++) {
    double angle = startAngle + (2.0 * PI * i) / sides;
    pts.push_back({center.x + radius * std::cos(angle),
                   center.y + radius * std::sin(angle)});
  }
  return pts;
}

// Generate star polygon points (alternating inner/outer radii)
inline std::vector<Point> starPolygon(Point center, double outerR,
                                      double innerR, int points,
                                      double startAngle = -PI / 2) {
  std::vector<Point> pts;
  for (int i = 0; i < points * 2; i++) {
    double angle = startAngle + (PI * i) / points;
    double r = (i % 2 == 0) ? outerR : innerR;
    pts.push_back(
        {center.x + r * std::cos(angle), center.y + r * std::sin(angle)});
  }
  return pts;
}

// Cubic bezier point at parameter t
inline Point bezierPoint(Point p0, Point p1, Point p2, Point p3, double t) {
  double u = 1.0 - t;
  return p0 * (u * u * u) + p1 * (3 * u * u * t) + p2 * (3 * u * t * t) +
         p3 * (t * t * t);
}

// Apply N-fold rotational symmetry
inline std::vector<std::vector<Point>>
applyRotationalSymmetry(const std::vector<Point> &shape, int folds,
                        Point center = {0, 0}) {
  std::vector<std::vector<Point>> result;
  for (int i = 0; i < folds; i++) {
    double angle = (2.0 * PI * i) / folds;
    std::vector<Point> rotated;
    for (const auto &p : shape) {
      rotated.push_back(p.rotate(angle, center));
    }
    result.push_back(rotated);
  }
  return result;
}

} // namespace gachbong
