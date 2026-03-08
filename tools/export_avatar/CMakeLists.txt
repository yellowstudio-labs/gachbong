cmake_minimum_required(VERSION 3.13)
project(export_avatar)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Build gach-bong-core
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../gach-bong-core ${CMAKE_BINARY_DIR}/gach-bong-core)

add_executable(export_avatar main.cpp)
target_link_libraries(export_avatar PRIVATE gachbong_core)

# stb_image_write is included as header-only in main.cpp
target_include_directories(export_avatar PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
