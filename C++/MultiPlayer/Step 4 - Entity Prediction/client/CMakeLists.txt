cmake_minimum_required(VERSION 3.10)
project(Client)

#
# Manually specifying all the source files.
#
set(CLIENT_SOURCE_FILES
    main.cpp
    GameModel.cpp
    MessageQueueClient.cpp
    )
set(CLIENT_HEADER_FILES 
    GameModel.hpp
    MessageQueueClient.hpp
    )

set(CLIENT_COMPONENTS_HEADERS
    components/Goal.hpp
    components/Sprite.hpp
    )
set(CLIENT_COMPONENTS_SOURCES
    )

set(CLIENT_SYSTEMS_HEADERS
    systems/KeyboardInput.hpp
    systems/Movement.hpp
    systems/Network.hpp
    systems/Renderer.hpp
    )
set(CLIENT_SYSTEMS_SOURCES
    systems/KeyboardInput.cpp
    systems/Movement.cpp
    systems/Network.cpp
    systems/Renderer.cpp
    )

#
# Organize the files into some logical groups
#
source_group("Main\\Header Files" FILES ${CLIENT_HEADER_FILES})
source_group("Main\\Source Files" FILES ${CLIENT_SOURCE_FILES})

source_group("Components\\Header Files" FILES ${CLIENT_COMPONENTS_HEADERS})
source_group("Components\\Source Files" FILES ${CLIENT_COMPONENTS_SOURCES})

source_group("Systems\\Header Files" FILES ${CLIENT_SYSTEMS_HEADERS})
source_group("Systems\\Source Files" FILES ${CLIENT_SYSTEMS_SOURCES})

#
# Need a list of all code files for convenience
#
set(CLIENT_CODE_FILES
    ${CLIENT_SOURCE_FILES}
    ${CLIENT_HEADER_FILES}
    ${CLIENT_COMPONENTS_HEADERS}
    ${CLIENT_COMPONENTS_SOURCES}
    ${CLIENT_SYSTEMS_HEADERS}
    ${CLIENT_SYSTEMS_SOURCES}
    )

#
# This is the Client executable target
#
add_executable(Client ${CLIENT_CODE_FILES})
set(CLIENT_CODE_FILES ${CLIENT_CODE_FILES} PARENT_SCOPE)    # Exporting to parent scope for clang-format

target_include_directories(Client PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

#
# Want the C++ 17 standard for our project
#
set_property(TARGET Client PROPERTY CXX_STANDARD 17)

#
# Enable a lot of warnings, forcing better code to be written
#
unset(SOCKET_LIBRARY)
if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_options(Client PRIVATE /W4 /permissive-)
    set(SOCKET_LIBRARY ws2_32)
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
    target_compile_options(Client PRIVATE -O3 -Wall -Wextra -pedantic) # -Wconversion -Wsign-conversion
endif()

#
# Enable static multithreaded library linking for MSVC
# Reference: https://cmake.org/cmake/help/latest/prop_tgt/MSVC_RUNTIME_LIBRARY.html#prop_tgt:MSVC_RUNTIME_LIBRARY
if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_options(Client PRIVATE "/MT$<$<CONFIG:Debug>:d>")
endif()


#
# Move the assets into the build folder so they load at runtime (inside MSVC)
#
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/assets/playerShip1_blue.png ${CMAKE_CURRENT_BINARY_DIR}/assets/playerShip1_blue.png COPYONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/assets/playerShip1_red.png ${CMAKE_CURRENT_BINARY_DIR}/assets/playerShip1_red.png COPYONLY)

target_link_libraries(Client Shared sfml-main sfml-graphics sfml-audio sfml-system sfml-window sfml-network ${SOCKET_LIBRARY})
