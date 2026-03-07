# Gạch Bông — Tile Matching Game

A Vietnamese cement tile (gạch bông) matching game where all tile patterns are rendered using pure mathematical geometry — no image assets. Built with a cross-platform C++ core engine and a React + TypeScript web frontend.

## Features

- 🎨 **20 authentic gạch bông patterns** — Hoa Sen, Bông Mai, Gạch Tàu, and more
- 🧮 **Pure math rendering** — all patterns drawn with circles, arcs, polygons, and bezier curves
- 🎮 **Classic tile matching** — connect pairs with paths of ≤ 2 turns
- 🔀 **Auto-shuffle** — board reshuffles when no matches remain
- 💡 **Hint system** — find a valid match when stuck
- 🏗️ **Cross-platform core** — C++ engine works on Web, iOS, Android, Desktop
- 🎬 **Music Videos** — cinematic MV intros with live-coded music (Strudel) synced to animated pattern visuals
- 🎵 **Live-coded music** — Vietnamese pentatonic compositions powered by @strudel/web

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Core Engine | C++17 (`gach-bong-core/`) |
| Web Runtime | WebAssembly via Emscripten |
| Frontend | React 19 + TypeScript 5.9 + Vite 7 |
| Music | @strudel/web (TidalCycles for browser) |
| Styling | Vanilla CSS |

## Prerequisites

- **Node.js** 18+ and **Yarn**
- **Emscripten SDK** (for building the WASM module)
- **CMake** 3.13+

### Installing Emscripten (macOS)

```bash
brew install emscripten
```

Or manually via [emsdk](https://emscripten.org/docs/getting_started/downloads.html):

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url> gach-bong
cd gach-bong
yarn install
```

### 2. Build the WASM Engine

```bash
cd wasm
mkdir -p build && cd build
emcmake cmake ..
emmake make -j4
```

This produces `gach_bong.js` and `gach_bong.wasm` in `wasm/build/`.

### 3. Run the Dev Server

```bash
# From project root
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
gach-bong/
├── gach-bong-core/             ← Pure C++ library (platform-independent)
│   ├── include/gachbong/       ← Public API headers
│   │   ├── geometry.h          ← Point, Color, polygon math
│   │   ├── renderer.h          ← IRenderer abstract interface
│   │   ├── patterns.h          ← PatternType enum, Palette, palettes
│   │   ├── board.h             ← Board game state
│   │   └── pathfinder.h        ← BFS path finding
│   └── src/                    ← Implementation
│       ├── patterns/           ← 20 pattern renderers (4 categories)
│       ├── board.cpp
│       ├── pathfinder.cpp
│       └── patterns.cpp        ← Pattern dispatcher
│
├── wasm/                       ← WebAssembly wrapper
│   ├── CMakeLists.txt          ← Links gach-bong-core + Emscripten flags
│   └── src/
│       ├── canvas_renderer.*   ← IRenderer → HTML5 Canvas 2D
│       └── engine.cpp          ← Embind JS exports
│
├── src/                        ← Web frontend (React + TypeScript)
│   ├── App.tsx                 ← Main app component
│   ├── components/
│   │   ├── GameBoard.tsx       ← Canvas game board
│   │   ├── GameMenu.tsx        ← Game controls (new, hint, shuffle)
│   │   ├── GameOverModal.tsx   ← Win screen
│   │   ├── MusicVideo.tsx      ← MV player with scene-based timeline
│   │   ├── PatternShowcase.tsx ← Pattern gallery / preview
│   │   └── ScoreBoard.tsx      ← Score display
│   ├── music/
│   │   └── strudelIntro.ts     ← Strudel music composition + playback API
│   ├── hooks/
│   │   ├── useGameState.ts     ← Game state management
│   │   └── useWasmEngine.ts    ← WASM module loader
│   ├── engine/
│   │   └── types.ts            ← TypeScript type definitions
│   └── styles/
│       ├── index.css           ← Global styles
│       └── MusicVideo.css      ← MV animations & scene styles
│
├── docs/                       ← Documentation
│   ├── overview.md             ← This file
│   ├── architecture.md         ← System architecture & dependency graph
│   ├── core-library.md         ← Core lib API, build & integration guide
│   ├── pattern-system.md       ← Pattern rendering system & how to add patterns
│   ├── game-logic.md           ← Board generation, pathfinding, game flow
│   └── mv/                     ← MV timeline scripts
│       ├── 01-intro.md         ← MV Intro timeline & script
│       └── 02-hoa-chanh-saigon-retro.md ← Next MV proposal
│
├── public/                     ← Static assets
├── index.html                  ← Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Development Workflow

### Modifying the C++ Core

After editing files in `gach-bong-core/` or `wasm/src/`:

```bash
cd wasm/build
emmake make -j4
```

The dev server will hot-reload if `yarn dev` is running.

### Modifying the Frontend

Edit files in `src/`. Vite provides instant HMR — no build needed.

### Adding a New Pattern

See the step-by-step guide in [pattern-system.md](pattern-system.md#adding-a-new-pattern).

### Building for Production

```bash
# Build WASM first
cd wasm/build && emmake make -j4

# Build frontend
cd ../..
yarn build
```

Output goes to `dist/`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server with HMR |
| `yarn build` | TypeScript check + production build |
| `yarn preview` | Preview production build locally |
| `yarn lint` | Run ESLint |

## Documentation

| Document | Contents |
|----------|----------|
| [architecture.md](architecture.md) | System architecture, dependency graph, platform strategy |
| [core-library.md](core-library.md) | Core C++ lib API, build for WASM/iOS/Android, integration examples |
| [pattern-system.md](pattern-system.md) | All 20 patterns, palette system, adding new patterns |
| [game-logic.md](game-logic.md) | Board generation, BFS pathfinding, hint system, game flow |
| [mv/01-intro.md](mv/01-intro.md) | MV Intro timeline, scenes, music details |
| [mv/02-hoa-chanh-saigon-retro.md](mv/02-hoa-chanh-saigon-retro.md) | Next MV proposal: Hoa Chanh – Sài Gòn Retro |

## License

Private project.
