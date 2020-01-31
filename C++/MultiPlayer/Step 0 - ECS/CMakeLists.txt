cmake_minimum_required(VERSION 3.10)
project(Multiplayer-Step0-ECS)

#
# Manually specifying all the source files.
#
set(SOURCE_FILES
    main.cpp
    GameModel.cpp
    )
set(HEADER_FILES 
    GameModel.hpp
    )

set(ENTITY_HEADERS
    entities/Entity.hpp
    entities/PlayerShip.hpp
    )
set(ENTITY_SOURCES
    entities/Entity.cpp
    entities/PlayerShip.cpp
    )

set(COMPONENTS_HEADERS
    components/Component.hpp
    components/Movement.hpp
    components/Input.hpp
    components/Position.hpp
    components/Size.hpp
    components/Sprite.hpp
    )
set(COMPONENTS_SOURCES
    )

set(SYSTEMS_HEADERS
    systems/System.hpp
    systems/KeyboardInput.hpp
    systems/Renderer.hpp
    )
set(SYSTEMS_SOURCES
    systems/System.cpp
    systems/KeyboardInput.cpp
    systems/Renderer.cpp
    )

#
# Organize the files into some logical groups
#
source_group("Main\\Header Files" FILES ${HEADER_FILES})
source_group("Main\\Source Files" FILES ${SOURCE_FILES})

source_group("Components\\Header Files" FILES ${COMPONENTS_HEADERS})
source_group("Components\\Source Files" FILES ${COMPONENTS_SOURCES})

source_group("Entities\\Header Files" FILES ${ENTITY_HEADERS})
source_group("Entities\\Source Files" FILES ${ENTITY_SOURCES})

source_group("Systems\\Header Files" FILES ${SYSTEMS_HEADERS})
source_group("Systems\\Source Files" FILES ${SYSTEMS_SOURCES})

#
# Convenience for clang-format
#
set(ALL_CODE_FILES
    ${SOURCE_FILES}
    ${HEADER_FILES}
    ${COMPONENTS_HEADERS}
    ${COMPONENTS_SOURCES}
    ${ENTITY_HEADERS}
    ${ENTITY_SOURCES}
    ${SYSTEMS_HEADERS}
    ${SYSTEMS_SOURCES}
    )

#
# This is the main target
#
add_executable(Multiplayer-Step0-ECS ${ALL_CODE_FILES})
#
# Doing the followoing so that the source code can do includes like...
# #include "components/Component.hpp"
# instead of...
# #include "../components/Component.hpp"
#
target_include_directories(Multiplayer-Step0-ECS PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

#
# Want the C++ 17 standard for our project
#
set_property(TARGET Multiplayer-Step0-ECS PROPERTY CXX_STANDARD 17)

#
# Enable a lot of warnings, forcing better code to be written
#
if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_options(Multiplayer-Step0-ECS PRIVATE /W4 /permissive-)
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
    target_compile_options(Multiplayer-Step0-ECS PRIVATE -O3 -Wall -Wextra -pedantic) # -Wconversion -Wsign-conversion
endif()

#
# Move the assets into the build folder so they load at runtime (inside MSVC)
#
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/assets/playerShip1_blue.png ${CMAKE_CURRENT_BINARY_DIR}/assets/playerShip1_blue.png COPYONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/assets/playerShip1_red.png ${CMAKE_CURRENT_BINARY_DIR}/assets/playerShip1_red.png COPYONLY)

#
# ------------------------ Add SFML ------------------------
#

# This causes the SFML .dll files to be copied into the Multiplayer-Step0-ECS executable folder.
# Only need this for development time, for a production release statically link
# everything together: set BUILD_SHARED_LIBS to FALSE
# Reference: https://en.sfml-dev.org/forums/index.php?topic=24070.0
# Reference: https://stackoverflow.com/questions/10671916/how-to-copy-dll-files-into-the-same-folder-as-the-executable-using-cmake
set (CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
set (CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

add_subdirectory(ThirdParty/SFML-2.5.1)
include_directories(ThirdParty/SFML-2.5.1/include)
add_dependencies(Multiplayer-Step0-ECS sfml-main sfml-graphics sfml-audio sfml-system sfml-window sfml-network)
target_link_libraries(Multiplayer-Step0-ECS sfml-main sfml-graphics sfml-audio sfml-system sfml-window sfml-network)

#
# ------------------------ Add CTTI ------------------------
#

#
# Reference: https://github.com/Manu343726/ctti
add_subdirectory(ThirdParty/ctti)
include_directories(ThirdParty/ctti/include)

#
# ------------------------ Clang Format ------------------------
#
#
# Prepare a pre-build step to run clang-format over all the [ch]pp source files.
# Start by finding the location of the clang-format executable.
#
find_program(CLANG_FORMAT "clang-format")
if (CLANG_FORMAT)
    message("Clang-Format found at: " ${CLANG_FORMAT})

    #
    # Need to take the simple source file locations used for the project and get their full
    # file system locations for use in putting together the clang-format command line
    #
    unset(CODE_FILES_PATHS)
    foreach(CODE_FILE ${ALL_CODE_FILES})
        get_source_file_property(WHERE ${CODE_FILE} LOCATION)
        set(CODE_FILES_PATHS ${CODE_FILES_PATHS} ${WHERE})
    endforeach()

    #
    # This creates the clang-format target/command
    #
    add_custom_target(
        ClangFormat
        COMMAND ${CLANG_FORMAT}
        -i
        -style=file
        ${CODE_FILES_PATHS}
    )
    #
    # This makes the clang-format target a dependency of the main Multiplayer-Step0-ECS project
    #
    # add_dependencies(Multiplayer-Step0-ECS ClangFormat)
else()
    message("Unable to find clang-format")
endif()
