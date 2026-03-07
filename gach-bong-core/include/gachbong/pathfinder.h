#pragma once
#include <utility>
#include <vector>

namespace gachbong {

struct PathResult {
  bool valid;
  std::vector<std::pair<int, int>> path; // sequence of (row, col) points
  int turns;
};

class Pathfinder {
public:
  // Find a valid path from (r1,c1) to (r2,c2) with at most 2 turns
  // board[row][col]: -1 = empty, >=0 = tile type
  // Allows paths to go through the border (one cell outside the grid)
  static PathResult findPath(const std::vector<std::vector<int>> &board, int r1,
                             int c1, int r2, int c2);

  // Check if any valid match exists on the board
  // Returns a pair of positions, or {{-1,-1},{-1,-1}} if none
  static std::pair<std::pair<int, int>, std::pair<int, int>>
  findAnyMatch(const std::vector<std::vector<int>> &board);

  // Check if the board is solvable (has at least one valid match)
  static bool isSolvable(const std::vector<std::vector<int>> &board);
};

} // namespace gachbong
