cmake_minimum_required(VERSION 3.10)
project(Shared)

#
# Manually specifying all the source files.
#
set(SHARED_ENTITY_HEADERS
    entities/Entity.hpp
    )
set(SHARED_ENTITY_SOURCES
    entities/Entity.cpp
    )

set(SHARED_COMPONENTS_HEADERS
    components/Component.hpp
    )
set(SHARED_COMPONENTS_SOURCES
    )

set(SHARED_SYSTEMS_HEADERS
    systems/System.hpp
    )
set(SHARED_SYSTEMS_SOURCES
    systems/System.cpp
    )

#
# Organize the files into some logical groups
#
source_group("Components\\Header Files" FILES ${SHARED_COMPONENTS_HEADERS})
source_group("Components\\Source Files" FILES ${SHARED_COMPONENTS_SOURCES})

source_group("Entities\\Header Files" FILES ${SHARED_ENTITY_HEADERS})
source_group("Entities\\Source Files" FILES ${SHARED_ENTITY_SOURCES})

source_group("Systems\\Header Files" FILES ${SHARED_SYSTEMS_HEADERS})
source_group("Systems\\Source Files" FILES ${SHARED_SYSTEMS_SOURCES})

#
# Need a list of all code files for convenience
#
set(SHARED_CODE_FILES
    ${SHARED_COMPONENTS_HEADERS}
    ${SHARED_COMPONENTS_SOURCES}
    ${SHARED_ENTITY_HEADERS}
    ${SHARED_ENTITY_SOURCES}
    ${SHARED_SYSTEMS_HEADERS}
    ${SHARED_SYSTEMS_SOURCES}
    )

#
# This is the shared library target
#
add_library(Shared STATIC ${SHARED_CODE_FILES})
set(SHARED_CODE_FILES ${SHARED_CODE_FILES} PARENT_SCOPE)    # Exporting to parent scope for clang-format

target_include_directories(Shared PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

#
# Want the C++ 17 standard for our project
#
set_property(TARGET Shared PROPERTY CXX_STANDARD 17)

#
# Enable a lot of warnings, forcing better code to be written
#
if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_options(Shared PRIVATE /W4 /permissive-)
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
    target_compile_options(Shared PRIVATE -O3 -Wall -Wextra -pedantic) # -Wconversion -Wsign-conversion
endif()
