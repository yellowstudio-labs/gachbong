#include <cstring>
#include <gachbong/pathfinder.h>
#include <queue>

namespace gachbong {

// Directions: 0=up, 1=right, 2=down, 3=left
static const int DR[] = {-1, 0, 1, 0};
static const int DC[] = {0, 1, 0, -1};

struct BFSState {
  int r, c, dir, turns;
  std::vector<std::pair<int, int>> path;
};

PathResult Pathfinder::findPath(const std::vector<std::vector<int>> &board,
                                int r1, int c1, int r2, int c2) {
  int rows = board.size();
  int cols = board[0].size();

  // Same cell
  if (r1 == r2 && c1 == c2)
    return {false, {}, 0};

  // Different tile types
  if (board[r1][c1] != board[r2][c2])
    return {false, {}, 0};

  // BFS: visited[r][c][dir] = minimum turns to reach (r,c) coming from
  // direction dir Expand grid by 1 in each direction to allow paths outside the
  // board
  int eRows = rows + 2;
  int eCols = cols + 2;

  // Map coordinates: board (r,c) -> expanded (r+1, c+1)
  int sr = r1 + 1, sc = c1 + 1;
  int er = r2 + 1, ec = c2 + 1;

  // visited[r][c][d] = min turns to reach here from direction d, -1 = unvisited
  std::vector<std::vector<std::vector<int>>> visited(
      eRows, std::vector<std::vector<int>>(eCols, std::vector<int>(4, 999)));

  std::queue<BFSState> q;

  // Start: try all 4 directions from source
  for (int d = 0; d < 4; d++) {
    int nr = sr + DR[d];
    int nc = sc + DC[d];
    if (nr < 0 || nr >= eRows || nc < 0 || nc >= eCols)
      continue;

    // Target reached directly
    if (nr == er && nc == ec) {
      return {true, {{r1, c1}, {r2, c2}}, 0};
    }

    // Check if cell is passable (empty in original board, or outside original
    // board)
    int origR = nr - 1, origC = nc - 1;
    bool passable = (origR < 0 || origR >= rows || origC < 0 || origC >= cols ||
                     board[origR][origC] < 0);

    if (passable && 0 < visited[nr][nc][d]) {
      visited[nr][nc][d] = 0;
      q.push({nr, nc, d, 0, {{r1, c1}, {origR, origC}}});
    }
  }

  PathResult best = {false, {}, 999};

  while (!q.empty()) {
    auto cur = q.front();
    q.pop();

    if (cur.turns > 2)
      continue;
    if (cur.turns >= best.turns && best.valid)
      continue;

    for (int d = 0; d < 4; d++) {
      int newTurns = cur.turns + (d != cur.dir ? 1 : 0);
      if (newTurns > 2)
        continue;

      int nr = cur.r + DR[d];
      int nc = cur.c + DC[d];
      if (nr < 0 || nr >= eRows || nc < 0 || nc >= eCols)
        continue;

      // Reached target
      if (nr == er && nc == ec) {
        if (!best.valid || newTurns < best.turns ||
            (newTurns == best.turns &&
             cur.path.size() + 1 < best.path.size())) {
          auto path = cur.path;
          path.push_back({r2, c2});
          best = {true, path, newTurns};
        }
        continue;
      }

      // Check passable
      int origR = nr - 1, origC = nc - 1;
      bool passable = (origR < 0 || origR >= rows || origC < 0 ||
                       origC >= cols || board[origR][origC] < 0);

      if (passable && newTurns < visited[nr][nc][d]) {
        visited[nr][nc][d] = newTurns;
        auto newPath = cur.path;
        newPath.push_back({origR, origC});
        q.push({nr, nc, d, newTurns, newPath});
      }
    }
  }

  return best;
}

std::pair<std::pair<int, int>, std::pair<int, int>>
Pathfinder::findAnyMatch(const std::vector<std::vector<int>> &board) {
  int rows = board.size();
  int cols = board[0].size();

  // Collect tiles by type
  std::vector<std::vector<std::pair<int, int>>> tilesByType(
      12); // max 12 patterns

  for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
      if (board[r][c] >= 0) {
        tilesByType[board[r][c]].push_back({r, c});
      }
    }
  }

  // Check each type for a valid pair
  for (const auto &tiles : tilesByType) {
    for (size_t i = 0; i < tiles.size(); i++) {
      for (size_t j = i + 1; j < tiles.size(); j++) {
        auto result = findPath(board, tiles[i].first, tiles[i].second,
                               tiles[j].first, tiles[j].second);
        if (result.valid) {
          return {tiles[i], tiles[j]};
        }
      }
    }
  }

  return {{-1, -1}, {-1, -1}};
}

bool Pathfinder::isSolvable(const std::vector<std::vector<int>> &board) {
  auto match = findAnyMatch(board);
  return match.first.first != -1;
}

} // namespace gachbong
