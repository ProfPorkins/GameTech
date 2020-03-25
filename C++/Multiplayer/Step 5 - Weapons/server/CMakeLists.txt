cmake_minimum_required(VERSION 3.10)
project(Server)

#
# Manually specifying all the source files.
#
set(SERVER_SOURCE_FILES
    main.cpp
    GameModel.cpp
    MessageQueueServer.cpp
    )
set(SERVER_HEADER_FILES 
    GameModel.hpp
    MessageQueueServer.hpp
    )

set(SERVER_ENTITY_HEADERS
    )
set(SERVER_ENTITY_SOURCES
    )

set(SERVER_COMPONENTS_HEADERS
    )
set(SERVER_COMPONENTS_SOURCES
    )

set(SERVER_SYSTEMS_HEADERS
    systems/Damage.hpp
    systems/Momentum.hpp
    systems/Network.hpp
    )
set(SERVER_SYSTEMS_SOURCES
    systems/Damage.cpp
    systems/Momentum.cpp
    systems/Network.cpp
    )

#
# Organize the files into some logical groups
#
source_group("Main\\Header Files" FILES ${SERVER_HEADER_FILES})
source_group("Main\\Source Files" FILES ${SERVER_SOURCE_FILES})

source_group("Components\\Header Files" FILES ${SERVER_COMPONENTS_HEADERS})
source_group("Components\\Source Files" FILES ${SERVER_COMPONENTS_SOURCES})

source_group("Entities\\Header Files" FILES ${SERVER_ENTITY_HEADERS})
source_group("Entities\\Source Files" FILES ${SERVER_ENTITY_SOURCES})

source_group("Systems\\Header Files" FILES ${SERVER_SYSTEMS_HEADERS})
source_group("Systems\\Source Files" FILES ${SERVER_SYSTEMS_SOURCES})

#
# Need a list of all code files for convenience
#
set(SERVER_CODE_FILES
    ${SERVER_SOURCE_FILES}
    ${SERVER_HEADER_FILES}
    ${SERVER_COMPONENTS_HEADERS}
    ${SERVER_COMPONENTS_SOURCES}
    ${SERVER_ENTITY_HEADERS}
    ${SERVER_ENTITY_SOURCES}
    ${SERVER_SYSTEMS_HEADERS}
    ${SERVER_SYSTEMS_SOURCES}
    )

#
# This is the Server executable target
add_executable(Server ${SERVER_CODE_FILES})
set(SERVER_CODE_FILES ${SERVER_CODE_FILES} PARENT_SCOPE)    # Exporting to parent scope for clang-format

target_include_directories(Server PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

#
# Want the C++ 17 standard for our project
#
set_property(TARGET Server PROPERTY CXX_STANDARD 17)

#
# Enable a lot of warnings, forcing better code to be written
#
unset(SOCKET_LIBRARY)
if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_options(Server PRIVATE /W4 /permissive-)
    set(SOCKET_LIBRARY ws2_32)
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
    target_compile_options(Server PRIVATE -O3 -Wall -Wextra -pedantic) # -Wconversion -Wsign-conversion
endif()

#
# Enable static multithreaded library linking for MSVC
# Reference: https://cmake.org/cmake/help/latest/prop_tgt/MSVC_RUNTIME_LIBRARY.html#prop_tgt:MSVC_RUNTIME_LIBRARY
if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_options(Server PRIVATE "/MT$<$<CONFIG:Debug>:d>")
endif()


target_link_libraries(Server Shared sfml-main sfml-graphics sfml-audio sfml-system sfml-window sfml-network ${SOCKET_LIBRARY})
