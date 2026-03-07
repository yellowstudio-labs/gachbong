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

  // BFS: Find path with at most 2 turns.
  // We can track the path by exploring ray by ray (straight lines),
  // which naturally counts the number of line segments (turns = segments - 1).

  // Create an expanded board to allow paths along the outside edges
  int eRows = rows + 2;
  int eCols = cols + 2;
  int sr = r1 + 1, sc = c1 + 1;
  int er = r2 + 1, ec = c2 + 1;

  // visited[r][c] = minimum number of turns to reach (r,c)
  std::vector<std::vector<int>> visited(eRows, std::vector<int>(eCols, 999));

  // Queue stores: {current row, current col, current number of turns, path
  // taken}
  struct State {
    int r, c, turns;
    std::vector<std::pair<int, int>> path;
  };
  std::queue<State> q;

  q.push({sr, sc, 0, {{r1, c1}}});
  visited[sr][sc] = 0;

  PathResult best = {false, {}, 999};

  while (!q.empty()) {
    State cur = q.front();
    q.pop();

    // If we've already found a better or equal valid path (by turns), we can
    // stop exploring this branch if it has more turns than what we already
    // found. Or if we reach the max allowed turns (2).
    if (cur.turns > 2)
      continue;
    if (best.valid && cur.turns >= best.turns)
      continue;

    // Explore straight lines in all 4 directions from current position
    for (int d = 0; d < 4; d++) {
      int nr = cur.r;
      int nc = cur.c;
      int step = 1;

      while (true) {
        nr += DR[d];
        nc += DC[d];

        // Out of expanded bounds
        if (nr < 0 || nr >= eRows || nc < 0 || nc >= eCols)
          break;

        // Check if we reached the target
        if (nr == er && nc == ec) {
          std::vector<std::pair<int, int>> newPath = cur.path;
          newPath.push_back({r2, c2});

          // Only update if it's better
          if (!best.valid || cur.turns < best.turns ||
              (cur.turns == best.turns && newPath.size() < best.path.size())) {
            best = {true, newPath, cur.turns};
          }
          break; // Target found in this direction, no need to go further (it
                 // would just be going through the target)
        }

        // Check if the cell is impassable
        int origR = nr - 1, origC = nc - 1;
        bool isOutside =
            (origR < 0 || origR >= rows || origC < 0 || origC >= cols);
        bool isEmpty = isOutside || board[origR][origC] < 0;

        if (!isEmpty) {
          break; // Hit a tile, can't continue in this direction
        }

        // If it's a valid empty cell, we check if we can add it to the queue
        // We only add it if we reach it with fewer turns than previously
        // recorded. Or equal turns, but we just continue straight anyway.
        // Adding the state to queue happens when we turn in NEXT iterations.
        // What we queue here is the "intersection point" for the next turn.

        // Only enqueue if the number of turns we'll have (cur.turns) is <= what
        // was previously needed to get here. Wait, the next segment will
        // require a turn from this cell, so the next state will have `cur.turns
        // + 1`. However, we record `cur.turns + 1` in `visited` for this cell
        // because any path emanating from this cell in a *different* direction
        // will have that many turns.
        int nextTurns = cur.turns + 1;

        if (nextTurns <= 2 && nextTurns <= visited[nr][nc]) {
          visited[nr][nc] = nextTurns;

          std::vector<std::pair<int, int>> newPath = cur.path;
          newPath.push_back({origR, origC});
          q.push({nr, nc, nextTurns, newPath});
        }
      }
    }
  }

  return best;
}

#include <unordered_map>

std::pair<std::pair<int, int>, std::pair<int, int>>
Pathfinder::findAnyMatch(const std::vector<std::vector<int>> &board) {
  int rows = board.size();
  int cols = board[0].size();

  // Collect tiles by type (can be combined ID now)
  std::unordered_map<int, std::vector<std::pair<int, int>>> tilesByType;

  for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
      if (board[r][c] >= 0) {
        tilesByType[board[r][c]].push_back({r, c});
      }
    }
  }

  // Check each type for a valid pair
  for (const auto &pair : tilesByType) {
    const auto &tiles = pair.second;
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
