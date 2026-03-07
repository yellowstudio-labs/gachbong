cmake_minimum_required(VERSION 3.13)
project(gachbong_core)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Public headers
set(PUBLIC_HEADERS
    include/gachbong/geometry.h
    include/gachbong/renderer.h
    include/gachbong/patterns.h
    include/gachbong/board.h
    include/gachbong/pathfinder.h
)

# Source files
set(SOURCES
    src/board.cpp
    src/pathfinder.cpp
    src/patterns.cpp
    src/patterns/pattern_helpers.cpp
    src/patterns/traditional_floral.cpp
    src/patterns/geometric.cpp
    src/patterns/nature.cpp
    src/patterns/heritage.cpp
)

# Build as static library
add_library(gachbong_core STATIC ${SOURCES})

# Public include path
target_include_directories(gachbong_core
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# Install targets
install(TARGETS gachbong_core
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
)
install(DIRECTORY include/gachbong DESTINATION include)
