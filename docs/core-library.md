# Core Library (`gach-bong-core`)

A pure C++17 static library containing all platform-independent game logic and tile pattern rendering for the Gạch Bông tile matching game.

## Directory Structure

```
gach-bong-core/
├── CMakeLists.txt
├── include/gachbong/           ← Public headers (API surface)
│   ├── geometry.h              ← Point, Color, polygon generators
│   ├── renderer.h              ← IRenderer abstract interface
│   ├── patterns.h              ← PatternType enum, Palette, palettes
│   ├── board.h                 ← Board game state management
│   └── pathfinder.h            ← BFS pathfinding algorithm
└── src/                        ← Private implementation
    ├── board.cpp
    ├── pathfinder.cpp
    ├── patterns.cpp            ← Pattern dispatcher + metadata
    └── patterns/               ← Pattern renderers by category
        ├── pattern_helpers.h/cpp
        ├── traditional_floral.h/cpp  (7 patterns)
        ├── geometric.h/cpp           (7 patterns)
        ├── nature.h/cpp              (4 patterns)
        └── heritage.h/cpp            (2 patterns)
```

## Building

### Prerequisites

- CMake 3.13+
- C++17 compatible compiler (GCC 7+, Clang 5+, MSVC 2017+)

### Build as Static Library

```bash
cd gach-bong-core
mkdir build && cd build
cmake ..
make -j$(nproc)
```

This produces `libgachbong_core.a`.

### Build for WASM (via Emscripten)

The WASM wrapper links the core library automatically:

```bash
cd wasm/build
emcmake cmake ..
emmake make -j4
```

### Cross-Compile for iOS

```bash
cd gach-bong-core
mkdir build-ios && cd build-ios
cmake .. \
  -DCMAKE_SYSTEM_NAME=iOS \
  -DCMAKE_OSX_ARCHITECTURES="arm64" \
  -DCMAKE_OSX_DEPLOYMENT_TARGET=14.0
make -j$(nproc)
```

### Cross-Compile for Android (NDK)

```bash
cd gach-bong-core
mkdir build-android && cd build-android
cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-24
make -j$(nproc)
```

## API Reference

### `IRenderer` — Abstract Rendering Interface

The key abstraction that enables cross-platform rendering. Each target platform implements this interface with its own graphics API.

```cpp
class IRenderer {
public:
  virtual ~IRenderer() = default;

  // Primitives
  virtual void drawCircle(Point center, double radius, const Color &fill,
                          const Color &stroke = {0,0,0,0}, double lineWidth = 0) = 0;
  virtual void drawArc(Point center, double radius, double startAngle,
                       double endAngle, const Color &fill, ...) = 0;
  virtual void drawPolygon(const std::vector<Point> &points, const Color &fill, ...) = 0;
  virtual void drawLine(Point from, Point to, const Color &color, double lineWidth = 2) = 0;
  virtual void drawBezier(Point p0, Point p1, Point p2, Point p3, ...) = 0;
  virtual void drawPetal(Point center, double rx, double ry, double rotation, ...) = 0;

  // Tile helpers
  virtual void drawTileBackground(double x, double y, double size, const Color &bg,
                                  bool selected = false, bool highlighted = false) = 0;
  virtual void drawTileBorder(double x, double y, double size, ...) = 0;

  // Transform stack
  virtual void save() = 0;
  virtual void restore() = 0;
  virtual void translate(double x, double y) = 0;
  virtual void rotate(double angle) = 0;
  virtual void scale(double sx, double sy) = 0;

  // Canvas management
  virtual void clear(double width, double height, const Color &bg) = 0;
};
```

### Implementing a Platform Renderer

To port to a new platform, create a class that inherits from `IRenderer`:

```cpp
// Example: iOS Core Graphics renderer
#include <gachbong/renderer.h>
#import <CoreGraphics/CoreGraphics.h>

class CGRenderer : public gachbong::IRenderer {
public:
  CGRenderer(CGContextRef ctx) : ctx_(ctx) {}

  void drawCircle(Point center, double radius, const Color &fill,
                  const Color &stroke, double lineWidth) override {
    CGRect rect = CGRectMake(center.x - radius, center.y - radius,
                             radius * 2, radius * 2);
    CGContextSetRGBFillColor(ctx_, fill.r/255.0, fill.g/255.0,
                             fill.b/255.0, fill.a);
    CGContextFillEllipseInRect(ctx_, rect);
  }

  // ... implement remaining virtual methods
private:
  CGContextRef ctx_;
};
```

### `Board` — Game State

```cpp
#include <gachbong/board.h>
using namespace gachbong;

Board board;
board.init(8, 10, 20);            // 8 rows, 10 cols, 20 pattern types

int tile = board.getTile(3, 5);   // Get tile type at (3,5), -1 = empty
auto result = board.checkMatch(r1, c1, r2, c2);  // Check if two tiles match
board.removePair(r1, c1, r2, c2); // Remove a matched pair
auto hint = board.getHint();       // Find a valid match
board.shuffle();                   // Shuffle remaining tiles
bool done = board.isCleared();     // All tiles removed?
bool ok = board.isSolvable();      // At least one valid match exists?
```

### `renderPattern()` — Draw a Tile Pattern

```cpp
#include <gachbong/patterns.h>
using namespace gachbong;

// Render a pattern onto a renderer at position (cx, cy) with given size
renderPattern(myRenderer,              // IRenderer implementation
              PatternType::HOA_SEN,    // Pattern type
              PALETTES[0],            // Color palette
              100.0, 100.0,           // Center position (cx, cy)
              80.0);                  // Tile size

// Query pattern info
int count = getPatternCount();                    // 20
const char* name = getPatternName(PatternType::HOA_SEN);  // "Hoa Sen"
```

### `Pathfinder` — Path Finding

```cpp
#include <gachbong/pathfinder.h>
using namespace gachbong;

// Find path between two tiles (max 2 turns, can go through border)
auto result = Pathfinder::findPath(grid, r1, c1, r2, c2);
if (result.valid) {
  // result.path = sequence of (row, col) waypoints
  // result.turns = number of turns (0, 1, or 2)
}

// Find any valid match on the board
auto match = Pathfinder::findAnyMatch(grid);
// match = {{r1,c1}, {r2,c2}} or {{-1,-1},{-1,-1}} if none

// Check solvability
bool solvable = Pathfinder::isSolvable(grid);
```

## Integration Examples

### Swift (iOS)

```swift
// Bridge via Objective-C++
// MyGameBridge.mm
#include <gachbong/board.h>
#include <gachbong/patterns.h>

@implementation GameBridge {
    gachbong::Board _board;
    CGRenderer _renderer;  // Your IRenderer implementation
}

- (void)initGameWithRows:(int)rows cols:(int)cols {
    _board.init(rows, cols, 20);
}

- (void)renderTileAtRow:(int)row col:(int)col inContext:(CGContextRef)ctx size:(double)size {
    _renderer = CGRenderer(ctx);
    auto type = static_cast<gachbong::PatternType>(_board.getTile(row, col));
    int palIdx = _board.getPaletteIdx(row, col) % 6;
    gachbong::renderPattern(_renderer, type, gachbong::PALETTES[palIdx],
                            size/2, size/2, size);
}
@end
```

### Kotlin (Android via JNI)

```kotlin
// JNI bridge
external fun initGame(rows: Int, cols: Int, patterns: Int)
external fun getTile(row: Int, col: Int): Int
external fun checkMatch(r1: Int, c1: Int, r2: Int, c2: Int): MatchResult
external fun renderPattern(surface: Surface, patternId: Int, paletteId: Int,
                          cx: Float, cy: Float, size: Float)

companion object {
    init {
        System.loadLibrary("gachbong_android")
    }
}
```

### Flutter (via dart:ffi)

```dart
final dylib = DynamicLibrary.open('libgachbong_core.so');

final initGame = dylib.lookupFunction<
    Void Function(Int32, Int32, Int32),
    void Function(int, int, int)>('gachbong_init_game');

initGame(8, 10, 20);
```
