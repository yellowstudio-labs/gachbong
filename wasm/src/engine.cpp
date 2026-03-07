#include "canvas_renderer.h"
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <gachbong/board.h>
#include <gachbong/patterns.h>

using namespace emscripten;
using namespace gachbong;

// Global state
static Board g_board;
static CanvasRenderer g_renderer;

// ========== Helper: Parse JS options object → RenderOptions ==========

static RenderOptions parseRenderOptions(val opts) {
  RenderOptions ro;
  if (opts.isUndefined() || opts.isNull())
    return ro;

  if (opts.hasOwnProperty("borderWidth"))
    ro.borderWidth = opts["borderWidth"].as<double>();
  if (opts.hasOwnProperty("showBorder"))
    ro.showBorder = opts["showBorder"].as<bool>();
  if (opts.hasOwnProperty("cornerRadius"))
    ro.cornerRadius = opts["cornerRadius"].as<double>();
  if (opts.hasOwnProperty("padding"))
    ro.padding = opts["padding"].as<double>();
  if (opts.hasOwnProperty("enableTexture"))
    ro.enableTexture = opts["enableTexture"].as<bool>();
  if (opts.hasOwnProperty("textureIntensity"))
    ro.textureIntensity = opts["textureIntensity"].as<double>();
  if (opts.hasOwnProperty("enableWear"))
    ro.enableWear = opts["enableWear"].as<bool>();
  if (opts.hasOwnProperty("wearAmount"))
    ro.wearAmount = opts["wearAmount"].as<double>();
  if (opts.hasOwnProperty("enableBevel"))
    ro.enableBevel = opts["enableBevel"].as<bool>();
  if (opts.hasOwnProperty("bevelSize"))
    ro.bevelSize = opts["bevelSize"].as<double>();
  if (opts.hasOwnProperty("saturation"))
    ro.saturation = opts["saturation"].as<double>();
  if (opts.hasOwnProperty("brightness"))
    ro.brightness = opts["brightness"].as<double>();
  if (opts.hasOwnProperty("opacity"))
    ro.opacity = opts["opacity"].as<double>();
  if (opts.hasOwnProperty("showGrout"))
    ro.showGrout = opts["showGrout"].as<bool>();
  if (opts.hasOwnProperty("groutWidth"))
    ro.groutWidth = opts["groutWidth"].as<double>();
  if (opts.hasOwnProperty("groutColor")) {
    val gc = opts["groutColor"];
    ro.groutColor =
        Color(gc["r"].as<int>(), gc["g"].as<int>(), gc["b"].as<int>());
  }

  return ro;
}

// ========== Initialization ==========

void initEngine(val canvasCtx) { g_renderer.setContext(canvasCtx); }

void initGame(int rows, int cols, int numPatterns) {
  g_board.init(rows, cols, numPatterns);
}

// ========== Rendering ==========

void renderBoard(double tileSize) {
  int rows = g_board.getRows();
  int cols = g_board.getCols();

  g_renderer.clear(cols * tileSize, rows * tileSize, Color(18, 18, 30));

  const auto &grid = g_board.getGrid();
  const auto &palGrid = g_board.getPaletteGrid();

  for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
      if (grid[r][c] >= 0) {
        double x = c * tileSize;
        double y = r * tileSize;

        Color bg(38, 38, 55);
        g_renderer.drawTileBackground(x, y, tileSize, bg);

        PatternType type = static_cast<PatternType>(grid[r][c]);
        int palIdx = palGrid[r][c] % PALETTE_COUNT;
        renderPattern(g_renderer, type, PALETTES[palIdx], x + tileSize / 2,
                      y + tileSize / 2, tileSize);
      }
    }
  }
}

void renderSingleTile(int row, int col, double tileSize, bool selected,
                      bool highlighted) {
  const auto &grid = g_board.getGrid();
  const auto &palGrid = g_board.getPaletteGrid();

  if (grid[row][col] < 0)
    return;

  double x = col * tileSize;
  double y = row * tileSize;

  Color bg = selected ? Color(55, 55, 80) : Color(38, 38, 55);
  g_renderer.drawTileBackground(x, y, tileSize, bg, selected, highlighted);

  PatternType type = static_cast<PatternType>(grid[row][col]);
  int palIdx = palGrid[row][col] % PALETTE_COUNT;
  renderPattern(g_renderer, type, PALETTES[palIdx], x + tileSize / 2,
                y + tileSize / 2, tileSize);
}

void renderPath(val pathArray, double tileSize) {
  int length = pathArray["length"].as<int>();
  if (length < 2)
    return;

  Color pathColor(100, 255, 218, 0.8);

  for (int i = 0; i < length - 1; i++) {
    val point1 = pathArray[i];
    val point2 = pathArray[i + 1];

    double x1 = point1[1].as<double>() * tileSize + tileSize / 2;
    double y1 = point1[0].as<double>() * tileSize + tileSize / 2;
    double x2 = point2[1].as<double>() * tileSize + tileSize / 2;
    double y2 = point2[0].as<double>() * tileSize + tileSize / 2;

    g_renderer.drawLine({x1, y1}, {x2, y2}, pathColor, 3.0);
  }
}

void renderEmpty(int row, int col, double tileSize) {
  double x = col * tileSize;
  double y = row * tileSize;
  g_renderer.save();
  g_renderer.drawCircle({x + tileSize / 2, y + tileSize / 2}, 0,
                        Color(18, 18, 30));
  g_renderer.restore();
}

// ========== Game Logic ==========

val checkMatch(int r1, int c1, int r2, int c2) {
  auto result = g_board.checkMatch(r1, c1, r2, c2);

  val obj = val::object();
  obj.set("valid", result.valid);
  obj.set("turns", result.turns);

  val pathArr = val::array();
  for (size_t i = 0; i < result.path.size(); i++) {
    val point = val::array();
    point.call<void>("push", result.path[i].first);
    point.call<void>("push", result.path[i].second);
    pathArr.call<void>("push", point);
  }
  obj.set("path", pathArr);

  return obj;
}

bool removePair(int r1, int c1, int r2, int c2) {
  return g_board.removePair(r1, c1, r2, c2);
}

val getHint() {
  auto hint = g_board.getHint();
  val obj = val::object();

  val p1 = val::array();
  p1.call<void>("push", hint.first.first);
  p1.call<void>("push", hint.first.second);

  val p2 = val::array();
  p2.call<void>("push", hint.second.first);
  p2.call<void>("push", hint.second.second);

  obj.set("tile1", p1);
  obj.set("tile2", p2);
  obj.set("found", hint.first.first != -1);

  return obj;
}

void shuffleBoard() { g_board.shuffle(); }

bool isBoardCleared() { return g_board.isCleared(); }

bool isBoardSolvable() { return g_board.isSolvable(); }

int getRemainingTiles() { return g_board.getRemainingTiles(); }

int getBoardRows() { return g_board.getRows(); }

int getBoardCols() { return g_board.getCols(); }

int getTileAt(int row, int col) { return g_board.getTile(row, col); }

int getPatternCount_() { return getPatternCount(); }

// ========== Pattern Preview (basic — backward compatible) ==========

void renderPatternPreview(val ctx, int patternIdx, int paletteIdx,
                          double size) {
  CanvasRenderer previewRenderer;
  previewRenderer.setContext(ctx);

  previewRenderer.clear(size, size, Color(38, 38, 55));

  PatternType type = static_cast<PatternType>(
      patternIdx % static_cast<int>(PatternType::COUNT));
  int palIdx = paletteIdx % PALETTE_COUNT;

  renderPattern(previewRenderer, type, PALETTES[palIdx], size / 2, size / 2,
                size);
}

// ========== V2: Render with Options ==========

void renderPatternWithOptions(val ctx, int patternIdx, int paletteIdx,
                              double size, val options) {
  CanvasRenderer previewRenderer;
  previewRenderer.setContext(ctx);

  RenderOptions opts = parseRenderOptions(options);

  previewRenderer.clear(size, size, Color(38, 38, 55));

  PatternType type = static_cast<PatternType>(
      patternIdx % static_cast<int>(PatternType::COUNT));
  int palIdx = paletteIdx % PALETTE_COUNT;

  renderPattern(previewRenderer, type, PALETTES[palIdx], size / 2, size / 2,
                size, opts);
}

// ========== V2: Render Tessellation Grid ==========

void renderTessellation(val ctx, int patternIdx, int paletteIdx, int gridCols,
                        int gridRows, double tileSize, val options) {
  CanvasRenderer tessRenderer;
  tessRenderer.setContext(ctx);

  RenderOptions opts = parseRenderOptions(options);
  double groutW = opts.showGrout ? opts.groutWidth : 0.0;

  double totalW = gridCols * tileSize + (gridCols + 1) * groutW;
  double totalH = gridRows * tileSize + (gridRows + 1) * groutW;

  // Fill grout background
  if (opts.showGrout) {
    tessRenderer.clear(totalW, totalH, opts.groutColor);
  } else {
    tessRenderer.clear(totalW, totalH, Color(38, 38, 55));
  }

  PatternType type = static_cast<PatternType>(
      patternIdx % static_cast<int>(PatternType::COUNT));
  int palIdx = paletteIdx % PALETTE_COUNT;

  for (int r = 0; r < gridRows; r++) {
    for (int c = 0; c < gridCols; c++) {
      double x = groutW + c * (tileSize + groutW);
      double y = groutW + r * (tileSize + groutW);
      double cx = x + tileSize / 2;
      double cy = y + tileSize / 2;

      renderPattern(tessRenderer, type, PALETTES[palIdx], cx, cy, tileSize,
                    opts);
    }
  }
}

// ========== V2: Custom Palette Rendering ==========

void renderPatternCustomPalette(val ctx, int patternIdx, int pr, int pg, int pb,
                                int sr, int sg, int sb, int ar, int ag, int ab,
                                int bgr, int bgg, int bgb, int dr, int dg,
                                int db, double size, val options) {
  CanvasRenderer previewRenderer;
  previewRenderer.setContext(ctx);

  RenderOptions opts = parseRenderOptions(options);

  previewRenderer.clear(size, size, Color(38, 38, 55));

  Palette custom = {
      {pr, pg, pb}, {sr, sg, sb}, {ar, ag, ab}, {bgr, bgg, bgb}, {dr, dg, db}};

  PatternType type = static_cast<PatternType>(
      patternIdx % static_cast<int>(PatternType::COUNT));

  renderPattern(previewRenderer, type, custom, size / 2, size / 2, size, opts);
}

// ========== V2: Get Palette Colors ==========

val getPaletteColors(int paletteIdx) {
  int idx = paletteIdx % PALETTE_COUNT;
  const Palette &p = PALETTES[idx];

  val obj = val::object();

  auto colorToVal = [](const Color &c) {
    val co = val::object();
    co.set("r", c.r);
    co.set("g", c.g);
    co.set("b", c.b);
    return co;
  };

  obj.set("primary", colorToVal(p.primary));
  obj.set("secondary", colorToVal(p.secondary));
  obj.set("accent", colorToVal(p.accent));
  obj.set("background", colorToVal(p.background));
  obj.set("detail", colorToVal(p.detail));

  return obj;
}

std::string getPatternName_(int patternIdx) {
  PatternType type = static_cast<PatternType>(
      patternIdx % static_cast<int>(PatternType::COUNT));
  return std::string(getPatternName(type));
}

int getPaletteCount_() { return PALETTE_COUNT; }

// ========== Embind Exports ==========

EMSCRIPTEN_BINDINGS(gach_bong) {
  function("initEngine", &initEngine);
  function("initGame", &initGame);
  function("renderBoard", &renderBoard);
  function("renderSingleTile", &renderSingleTile);
  function("renderPath", &renderPath);
  function("renderEmpty", &renderEmpty);
  function("checkMatch", &checkMatch);
  function("removePair", &removePair);
  function("getHint", &getHint);
  function("shuffleBoard", &shuffleBoard);
  function("isBoardCleared", &isBoardCleared);
  function("isBoardSolvable", &isBoardSolvable);
  function("getRemainingTiles", &getRemainingTiles);
  function("getBoardRows", &getBoardRows);
  function("getBoardCols", &getBoardCols);
  function("getTileAt", &getTileAt);
  function("getPatternCount", &getPatternCount_);
  function("getPatternName", &getPatternName_);
  function("getPaletteCount", &getPaletteCount_);
  function("renderPatternPreview", &renderPatternPreview);
  // V2 APIs
  function("renderPatternWithOptions", &renderPatternWithOptions);
  function("renderTessellation", &renderTessellation);
  function("renderPatternCustomPalette", &renderPatternCustomPalette);
  function("getPaletteColors", &getPaletteColors);
}
