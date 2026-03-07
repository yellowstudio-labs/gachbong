#pragma once
#include "pathfinder.h"
#include "patterns.h"
#include <utility>
#include <vector>

namespace gachbong {

class Board {
public:
  Board();

  // Initialize board with given dimensions and number of pattern types
  void init(int rows, int cols, int numPatterns);

  // Get tile at position (-1 = empty)
  int getTile(int row, int col) const;

  // Get palette index for tile at position
  int getPaletteIdx(int row, int col) const;

  // Remove a pair of matched tiles
  bool removePair(int r1, int c1, int r2, int c2);

  // Check and get path between two tiles
  PathResult checkMatch(int r1, int c1, int r2, int c2);

  // Get hint (find a valid match)
  std::pair<std::pair<int, int>, std::pair<int, int>> getHint();

  // Shuffle remaining tiles ensuring solvability
  void shuffle();

  // Check if board is cleared
  bool isCleared() const;

  // Check if board is solvable
  bool isSolvable() const;

  // Getters
  int getRows() const { return rows_; }
  int getCols() const { return cols_; }
  int getRemainingTiles() const { return remainingTiles_; }

  const std::vector<std::vector<int>> &getGrid() const { return grid_; }
  const std::vector<std::vector<int>> &getPaletteGrid() const {
    return paletteGrid_;
  }

private:
  int rows_, cols_;
  int remainingTiles_;
  std::vector<std::vector<int>> grid_;        // tile pattern type (-1 = empty)
  std::vector<std::vector<int>> paletteGrid_; // palette index per tile

  void generateBoard(int numPatterns);
  void ensureSolvable();
  std::vector<std::vector<int>> getCombinedGrid() const;
};

} // namespace gachbong
