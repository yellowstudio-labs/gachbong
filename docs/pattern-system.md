# Pattern Rendering System

The core library ships with 20 authentic Vietnamese gạch bông (cement tile) patterns, organized into 4 categories. Each pattern is a function that draws onto an `IRenderer` using basic primitives.

## Coordinate System

All patterns are rendered relative to a **tile center** `(cx, cy)` with a given `size`:

```
(cx - size/2, cy - size/2) ─────── (cx + size/2, cy - size/2)
│                                                            │
│                       (cx, cy)                             │
│                      ← size →                              │
│                                                            │
(cx - size/2, cy + size/2) ─────── (cx + size/2, cy + size/2)
```

- `h = size * 0.5` — half-size, used extensively
- A 4% padding (`size * 0.04`) is applied inside the tile boundary
- All coordinates are doubles for sub-pixel precision

## Pattern Categories

### Traditional Floral (`traditional_floral.cpp`)

| # | Enum | Name | Description |
|---|------|------|-------------|
| 1 | `HOA_SEN` | Hoa Sen | Lotus flower — 4-fold petal symmetry with corner arcs |
| 2 | `BONG_MAI` | Bông Mai | Plum blossom — 5 center petals + edge half-circles |
| 3 | `BONG_CUC` | Bông Cúc | Chrysanthemum — 8 pointed triangle petals |
| 4 | `HOA_THI` | Hoa Thị | Cross-star — cross bars with circle lobes (school tile) |
| 5 | `HOA_CHANH` | Hoa Chanh | Lemon blossom — 8-pointed star from overlapping squares |
| 6 | `HOA_CUC_DAI` | Hoa Cúc Đại | Large chrysanthemum — 12 radiating petals |
| 7 | `LA_SEN` | Lá Sen | Lotus leaves — 4-fold curved leaves with veins |

### Geometric (`geometric.cpp`)

| # | Enum | Name | Description |
|---|------|------|-------------|
| 8 | `CANH_QUAT` | Cánh Quạt | Fan blades — quarter arcs from corners |
| 9 | `BAT_GIAC` | Bát Giác | Octagonal — nested octagon + star |
| 10 | `KIM_CUONG` | Kim Cương | Diamond — nested diamond frames with corner triangles |
| 11 | `BAN_CO` | Bàn Cờ | Chessboard — 4×4 alternating grid |
| 12 | `CHONG_CHONG` | Chong Chóng | Pinwheel — windmill triangle quadrants |
| 13 | `LUC_GIAC` | Lục Giác | Hexagonal star — overlapping triangles |
| 14 | `DONG_TAM` | Đồng Tâm | Concentric — nested circles with cross lines |

### Nature-Inspired (`nature.cpp`)

| # | Enum | Name | Description |
|---|------|------|-------------|
| 15 | `VAY_CA` | Vảy Cá | Fish scale — overlapping arc rows |
| 16 | `SONG_NUOC` | Sóng Nước | Water waves — alternating wave arcs |
| 17 | `MAY_CUON` | Mây Cuốn | Cloud spirals — layered quarter arcs at corners |
| 18 | `DAY_LEO` | Dây Leo | Vine scroll — diagonal vines with leaf pairs |

### Heritage (`heritage.cpp`)

| # | Enum | Name | Description |
|---|------|------|-------------|
| 19 | `HOI_VAN` | Hồi Văn | Meander — concentric square frames with step notches |
| 20 | `GACH_TAU` | Gạch Tàu | Terracotta — plain tile with cross, double border |

## Color Palette System

Each pattern is rendered with a `Palette` consisting of 5 colors:

```cpp
struct Palette {
  Color primary;      // Main color (dominant shapes)
  Color secondary;    // Complementary color (secondary shapes)
  Color accent;       // Highlight color (small accents, centers)
  Color background;   // Tile background fill
  Color detail;       // Border and fine line color
};
```

6 palettes are built-in, inspired by Vietnamese regional aesthetics:

| Index | Name | Theme |
|-------|------|-------|
| 0 | Gạch Cũ Sài Gòn | Terracotta & Navy (Saigon colonial) |
| 1 | Xưa Huế | Deep Blue & Gold (imperial Huế) |
| 2 | Đồng Bằng | Jade Green & Warm Brown (delta countryside) |
| 3 | Hoàng Cung | Royal Blue & Crimson (palace/temple) |
| 4 | Phố Cổ Hà Nội | Charcoal & Teal (old quarter) |
| 5 | Nâu Đất | Dark Brown & Burnt Orange (earthy) |

## Rendering Primitives

Patterns use these `IRenderer` primitives:

| Primitive | Use Case |
|-----------|----------|
| `drawCircle` | Centers, dots, circular motifs |
| `drawArc` | Quarter-circles, scales, wave arcs |
| `drawPolygon` | Squares, triangles, stars, diamonds |
| `drawLine` | Cross lines, veins, borders |
| `drawPetal` | Elliptical petal shapes (rotated ellipse) |

### Helper Functions

Two shared helpers in `pattern_helpers.h`:

```cpp
// Fill the tile background (with 4% padding)
void fillTileSquare(IRenderer &r, double cx, double cy, double size, const Color &bg);

// Stroke the tile border
void strokeTileSquare(IRenderer &r, double cx, double cy, double size,
                      const Color &col, double lineWidth = 1.0);
```

Every pattern calls `fillTileSquare()` first, then draws its shapes, and ends with `strokeTileSquare()`.

## Adding a New Pattern

### Step 1: Choose a Category

Place the pattern in the appropriate category file:
- `traditional_floral` — flower-based motifs
- `geometric` — geometric/mathematical shapes
- `nature` — natural elements (water, clouds, fish, plants)
- `heritage` — Vietnamese architectural/cultural motifs

### Step 2: Add the Enum Value

In `include/gachbong/patterns.h`, add a new value to `PatternType` **before `COUNT`**:

```cpp
enum class PatternType {
  // ... existing patterns ...
  GACH_TAU,
  MY_NEW_PATTERN,  // ← Add here
  COUNT
};
```

### Step 3: Implement the Render Function

In the chosen category file (e.g., `src/patterns/heritage.cpp`):

```cpp
void renderMyNewPattern(IRenderer &r, const Palette &p,
                        double cx, double cy, double s) {
  double h = s * 0.5;
  fillTileSquare(r, cx, cy, s, p.background);

  // Draw your pattern using r.drawCircle(), r.drawPolygon(), etc.
  // Use p.primary, p.secondary, p.accent for colors
  // Use h as the reference size for proportional layout

  strokeTileSquare(r, cx, cy, s, p.detail, 1.0);
}
```

### Step 4: Declare in the Category Header

In `src/patterns/heritage.h`:

```cpp
void renderMyNewPattern(IRenderer &r, const Palette &p,
                        double cx, double cy, double s);
```

### Step 5: Add to the Dispatcher

In `src/patterns.cpp`, add a case to the `renderPattern()` switch:

```cpp
case PatternType::MY_NEW_PATTERN:
  renderMyNewPattern(renderer, palette, cx, cy, size);
  break;
```

### Step 6: Add the Name

In `getPatternName()` in `src/patterns.cpp`, add the name to the array:

```cpp
static const char *names[] = {
    // ... existing names ...
    "Gạch Tàu", "My New Pattern"
};
```

### Step 7: Rebuild

```bash
cd wasm/build && emmake make -j4
```
