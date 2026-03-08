cmake_minimum_required(VERSION 3.13)
project(gach_bong_wasm)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add the core library
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../gach-bong-core
                 ${CMAKE_CURRENT_BINARY_DIR}/gach-bong-core)

# WASM wrapper sources (only platform-specific files)
set(SOURCES
    src/engine.cpp
    src/canvas_renderer.cpp
)

add_executable(gach_bong ${SOURCES})

# Link core library
target_link_libraries(gach_bong PRIVATE gachbong_core)

# Emscripten-specific flags
set_target_properties(gach_bong PROPERTIES
    SUFFIX ".js"
    LINK_FLAGS "\
        --bind \
        -sMODULARIZE=1 \
        -sEXPORT_NAME='GachBongEngine' \
        -sALLOW_MEMORY_GROWTH=1 \
        -sENVIRONMENT='web' \
        -sNO_EXIT_RUNTIME=1 \
        -sWASM=0 \
        -O0 \
    "
)

# Output to build directory
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
