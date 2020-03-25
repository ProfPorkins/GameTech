cmake_minimum_required(VERSION 3.10)
project(Shared)

#
# Manually specifying all the source files.
#
set(PROTOBUF_FILES
    messages/protos/ClientId.proto
    messages/protos/Entity.proto
    messages/protos/EntityId.proto
    messages/protos/Input.proto
    messages/protos/InputComponent.proto
    messages/protos/MessageId.proto
    messages/protos/MovementComponent.proto
    messages/protos/PositionComponent.proto
    messages/protos/SizeComponent.proto
    messages/protos/AppearanceComponent.proto
    messages/protos/Vector2f.proto
    )

set(SHARED_MESSAGES_HEADERS
    ConcurrentQueue.hpp
    messages/ConnectAck.hpp
    messages/Input.hpp
    messages/Join.hpp
    messages/Message.hpp
    messages/MessageTypes.hpp
    messages/NewEntity.hpp
    messages/RemoveEntity.hpp
    messages/UpdateEntity.hpp
    messages/Utility.hpp
    )

set(SHARED_MESSAGES_SOURCES
    messages/Input.cpp
    messages/NewEntity.cpp
    messages/RemoveEntity.cpp
    messages/UpdateEntity.cpp
    messages/Utility.cpp
    )

set(SHARED_ENTITY_HEADERS
    entities/Entity.hpp
    entities/Player.hpp
    )
set(SHARED_ENTITY_SOURCES
    entities/Entity.cpp
    entities/Player.cpp
    )

set(SHARED_COMPONENTS_HEADERS
    components/Appearance.hpp
    components/Component.hpp
    components/Input.hpp
    components/Movement.hpp
    components/Position.hpp
    components/Size.hpp
    )
set(SHARED_COMPONENTS_SOURCES
    )

set(SHARED_SYSTEMS_HEADERS
    systems/System.hpp
    )
set(SHARED_SYSTEMS_SOURCES
    systems/System.cpp
    )

set(SHARED_MISC_HEADERS
    misc/math.hpp
    )

set(SHARED_MISC_SOURCES
    )

#
# Generate the Protobuf source files
#
if (PROTOBUF_FOUND)
	message(STATUS "Google Protocol Buffers: " ${PROTOBUF_INCLUDE_DIRS})

    protobuf_generate_cpp(PROTOBUF_SOURCES PROTOBUF_HEADERS ${PROTOBUF_FILES})
endif()

#
# Organize the files into some logical groups
#
source_group("Misc\\Header Files" FILES ${SHARED_MISC_HEADERS})
source_group("Misc\\Source Files" FILES ${SHARED_MISC_SOURCES})

source_group("Components\\Header Files" FILES ${SHARED_COMPONENTS_HEADERS})
source_group("Components\\Source Files" FILES ${SHARED_COMPONENTS_SOURCES})

source_group("Entities\\Header Files" FILES ${SHARED_ENTITY_HEADERS})
source_group("Entities\\Source Files" FILES ${SHARED_ENTITY_SOURCES})

source_group("Systems\\Header Files" FILES ${SHARED_SYSTEMS_HEADERS})
source_group("Systems\\Source Files" FILES ${SHARED_SYSTEMS_SOURCES})

source_group("Messages\\Header Files" FILES ${SHARED_MESSAGES_HEADERS})
source_group("Messages\\Source Files" FILES ${SHARED_MESSAGES_SOURCES})

source_group("ProtoBuf\\Proto Files" FILES ${PROTOBUF_FILES})
source_group("ProtoBuf\\Header Files" FILES ${PROTOBUF_HEADERS})
source_group("ProtoBuf\\Source Files" FILES ${PROTOBUF_SOURCES})

#
# Need a list of all code files for convenience
#
set(SHARED_CODE_FILES
    ${SHARED_MISC_HEADERS}
    ${SHARED_MISC_SOURCES}
    ${SHARED_COMPONENTS_HEADERS}
    ${SHARED_COMPONENTS_SOURCES}
    ${SHARED_ENTITY_HEADERS}
    ${SHARED_ENTITY_SOURCES}
    ${SHARED_SYSTEMS_HEADERS}
    ${SHARED_SYSTEMS_SOURCES}
    ${SHARED_MESSAGES_HEADERS}
    ${SHARED_MESSAGES_SOURCES}
    )

#
# This is the shared library target
#
add_library(Shared STATIC ${SHARED_CODE_FILES} ${PROTOBUF_HEADERS} ${PROTOBUF_SOURCES})
target_link_libraries(Shared ${Protobuf_LIBRARIES})
target_include_directories(Shared PUBLIC ${Protobuf_INCLUDE_DIRS})

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
#    target_link_libraries(Shared PRIVATE ws2_32)
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
    target_compile_options(Shared PRIVATE -O3 -Wall -Wextra -pedantic) # -Wconversion -Wsign-conversion
endif()

#
# Enable static multithreaded library linking for MSVC
# Reference: https://cmake.org/cmake/help/latest/prop_tgt/MSVC_RUNTIME_LIBRARY.html#prop_tgt:MSVC_RUNTIME_LIBRARY
if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_options(Shared PRIVATE "/MT$<$<CONFIG:Debug>:d>")
endif()
