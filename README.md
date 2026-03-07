# Gạch Bông 🎨

A Vietnamese-style cement tile matching game built with C++, WebAssembly (asm.js), and React.

🌐 **Play online:** [gachbong.yellowstudio.vn](https://gachbong.yellowstudio.vn)

## Overview

**Gạch Bông** (Vietnamese Cement Tiles) is a tile-matching puzzle game inspired by the beautiful traditional cement tiles found across Vietnam. The game engine is written in C++ and compiled to JavaScript (asm.js) via [Emscripten](https://emscripten.org/), with a React + TypeScript frontend powered by [Vite](https://vitejs.dev/).

## Project Structure

```
gach-bong/
├── gach-bong-core/       # C++ core game engine (static library)
│   ├── include/          # Public headers (geometry, renderer, patterns, board, pathfinder)
│   └── src/              # Implementation (board logic, pattern rendering, pathfinding)
├── wasm/                 # Emscripten wrapper & build config
│   ├── src/              # WASM bindings (engine.cpp, canvas_renderer.cpp)
│   └── CMakeLists.txt    # CMake config for Emscripten build
├── src/                  # React + TypeScript web frontend
├── public/               # Static assets & compiled JS output
├── deploy/               # Deployment scripts
└── .github/workflows/    # CI/CD pipeline
```

## Prerequisites

- **Node.js** >= 20
- **Emscripten SDK** (for compiling C++ to asm.js) — [Installation guide](https://emscripten.org/docs/getting_started/downloads.html)
- **CMake** >= 3.13

## Getting Started

### 1. Install web dependencies

```bash
npm install
```

### 2. Run the web app (dev mode)

```bash
npm run dev
```

### 3. Build the C++ engine (requires Emscripten)

```bash
# First time: configure & build
npm run wasm:build

# Subsequent rebuilds
npm run wasm:rebuild

# Clean build artifacts
npm run wasm:clean
```

The compiled output (`gach_bong.js`) will be placed in `wasm/build/`.

### 4. Build for production

```bash
npm run build
```

## How It Works

1. **`gach-bong-core/`** — A pure C++ library containing the game logic: board management, tile pattern rendering (20 traditional Vietnamese patterns), and pathfinding for tile matching.

2. **`wasm/`** — An Emscripten wrapper that exposes the C++ engine to JavaScript via embind. It compiles to asm.js (a single `.js` file) for easy auditing and portability.

3. **`src/`** — A React + TypeScript frontend that loads the compiled engine and renders the game using HTML5 Canvas.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
