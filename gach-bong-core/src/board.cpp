#include <algorithm>
#include <chrono>
#include <gachbong/board.h>
#include <random>

namespace gachbong {

Board::Board() : rows_(0), cols_(0), remainingTiles_(0) {}

void Board::init(int rows, int cols, int numPatterns) {
  rows_ = rows;
  cols_ = cols;
  generateBoard(numPatterns);
  ensureSolvable();
}

int Board::getTile(int row, int col) const {
  if (row < 0 || row >= rows_ || col < 0 || col >= cols_)
    return -1;
  return grid_[row][col];
}

int Board::getPaletteIdx(int row, int col) const {
  if (row < 0 || row >= rows_ || col < 0 || col >= cols_)
    return 0;
  return paletteGrid_[row][col];
}

bool Board::removePair(int r1, int c1, int r2, int c2) {
  if (grid_[r1][c1] < 0 || grid_[r2][c2] < 0)
    return false;
  if (grid_[r1][c1] != grid_[r2][c2])
    return false;

  grid_[r1][c1] = -1;
  grid_[r2][c2] = -1;
  remainingTiles_ -= 2;
  return true;
}

PathResult Board::checkMatch(int r1, int c1, int r2, int c2) {
  if (r1 < 0 || r1 >= rows_ || c1 < 0 || c1 >= cols_)
    return {false, {}, 0};
  if (r2 < 0 || r2 >= rows_ || c2 < 0 || c2 >= cols_)
    return {false, {}, 0};
  if (grid_[r1][c1] < 0 || grid_[r2][c2] < 0)
    return {false, {}, 0};
  if (r1 == r2 && c1 == c2)
    return {false, {}, 0};
  if (grid_[r1][c1] != grid_[r2][c2])
    return {false, {}, 0};

  return Pathfinder::findPath(grid_, r1, c1, r2, c2);
}

std::pair<std::pair<int, int>, std::pair<int, int>> Board::getHint() {
  return Pathfinder::findAnyMatch(grid_);
}

void Board::shuffle() {
  // Collect remaining tiles
  std::vector<int> tiles;
  std::vector<int> palettes;
  std::vector<std::pair<int, int>> positions;

  for (int r = 0; r < rows_; r++) {
    for (int c = 0; c < cols_; c++) {
      if (grid_[r][c] >= 0) {
        tiles.push_back(grid_[r][c]);
        palettes.push_back(paletteGrid_[r][c]);
        positions.push_back({r, c});
      }
    }
  }

  // Shuffle tiles (keep palettes matched with tile types)
  unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
  std::default_random_engine rng(seed);

  // Pair tiles and palettes together for shuffle
  std::vector<std::pair<int, int>> tilePalette;
  for (size_t i = 0; i < tiles.size(); i++) {
    tilePalette.push_back({tiles[i], palettes[i]});
  }
  std::shuffle(tilePalette.begin(), tilePalette.end(), rng);

  // Place back
  for (size_t i = 0; i < positions.size(); i++) {
    grid_[positions[i].first][positions[i].second] = tilePalette[i].first;
    paletteGrid_[positions[i].first][positions[i].second] =
        tilePalette[i].second;
  }

  ensureSolvable();
}

bool Board::isCleared() const { return remainingTiles_ == 0; }

bool Board::isSolvable() const { return Pathfinder::isSolvable(grid_); }

void Board::generateBoard(int numPatterns) {
  int totalCells = rows_ * cols_;
  // Must be even
  if (totalCells % 2 != 0) {
    cols_--; // reduce by 1 to make even
    totalCells = rows_ * cols_;
  }

  int numPairs = totalCells / 2;

  // Create pairs of tiles
  std::vector<int> tiles;
  std::vector<int> palettes;

  unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
  std::default_random_engine rng(seed);

  for (int i = 0; i < numPairs; i++) {
    int type = i % numPatterns;
    int palette = i % 12; // 12 palettes available
    tiles.push_back(type);
    tiles.push_back(type);
    palettes.push_back(palette);
    palettes.push_back(palette);
  }

  // Shuffle together
  std::vector<int> indices(totalCells);
  for (int i = 0; i < totalCells; i++)
    indices[i] = i;
  std::shuffle(indices.begin(), indices.end(), rng);

  // Place on grid
  grid_.assign(rows_, std::vector<int>(cols_, -1));
  paletteGrid_.assign(rows_, std::vector<int>(cols_, 0));

  for (int i = 0; i < totalCells; i++) {
    int idx = indices[i];
    int r = i / cols_;
    int c = i % cols_;
    grid_[r][c] = tiles[idx];
    paletteGrid_[r][c] = palettes[idx];
  }

  remainingTiles_ = totalCells;
}

void Board::ensureSolvable() {
  int maxAttempts = 50;
  while (!isSolvable() && maxAttempts > 0) {
    // Re-shuffle
    std::vector<int> tiles;
    std::vector<int> palettes;
    std::vector<std::pair<int, int>> positions;

    for (int r = 0; r < rows_; r++) {
      for (int c = 0; c < cols_; c++) {
        if (grid_[r][c] >= 0) {
          tiles.push_back(grid_[r][c]);
          palettes.push_back(paletteGrid_[r][c]);
          positions.push_back({r, c});
        }
      }
    }

    unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
    std::default_random_engine rng(seed);

    std::vector<std::pair<int, int>> tp;
    for (size_t i = 0; i < tiles.size(); i++)
      tp.push_back({tiles[i], palettes[i]});
    std::shuffle(tp.begin(), tp.end(), rng);

    for (size_t i = 0; i < positions.size(); i++) {
      grid_[positions[i].first][positions[i].second] = tp[i].first;
      paletteGrid_[positions[i].first][positions[i].second] = tp[i].second;
    }

    maxAttempts--;
  }
}

} // namespace gachbong
