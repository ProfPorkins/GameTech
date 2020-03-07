cmake_minimum_required(VERSION 3.10)
project(Multiplayer-Step4-EntityPrediction)

#
# ------------------------ Google Protocol Buffers ------------------------
#
find_package(Protobuf REQUIRED)
include_directories(${Protobuf_INCLUDE_DIRS})

#
# ------------------------ Add SFML ------------------------
# This causes the SFML .dll files to be copied into the Multiplayer-Step0-ECS executable folder.
# Only need this for development time, for a production release statically link
# everything together: set BUILD_SHARED_LIBS to FALSE
# Reference: https://en.sfml-dev.org/forums/index.php?topic=24070.0
# Reference: https://stackoverflow.com/questions/10671916/how-to-copy-dll-files-into-the-same-folder-as-the-executable-using-cmake
#
set (CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
set (CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

add_subdirectory(ThirdParty/SFML-2.5.1)
include_directories(ThirdParty/SFML-2.5.1/include)

#
# ------------------------ Add CTTI ------------------------
# Reference: https://github.com/Manu343726/ctti
#
add_subdirectory(ThirdParty/ctti)
include_directories(ThirdParty/ctti/include)

#
# ------------------------ Add the Shared Project ------------------------
#
add_subdirectory(shared)
# This gets the /build/shared folders that include the generated files visible to the project
target_include_directories(Shared PUBLIC ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/shared)
add_dependencies(Shared sfml-main sfml-graphics sfml-audio sfml-system sfml-window sfml-network)

#
# ------------------------ Add the Server Project ------------------------
#
add_subdirectory(server)
target_include_directories(Server PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/shared)
# This gets the /build/shared folders that include the generated files visible to the project
target_include_directories(Server PUBLIC ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/shared)
add_dependencies(Server Shared protobuf::libprotobuf sfml-main sfml-graphics sfml-audio sfml-system sfml-window sfml-network)

#
# ------------------------ Add the Client Project ------------------------
#
add_subdirectory(client)
target_include_directories(Client PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/shared)
# This gets the /build/shared folders that include the generated files visible to the project
target_include_directories(Client PUBLIC ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/shared)
add_dependencies(Client Shared Server protobuf::libprotobuf sfml-main sfml-graphics sfml-audio sfml-system sfml-window sfml-network)

#
# ------------------------ Clang Format ------------------------
#
#
# Prepare a pre-build step to run clang-format over all the [ch]pp source files.
# Start by finding the location of the clang-format executable.
#
find_program(CLANG_FORMAT "clang-format")
if (CLANG_FORMAT)
    #
    # Need to take the simple source file locations used for the project and get their full
    # file system locations for use in putting together the clang-format command line
    #
    unset(CODE_FILES_PATHS)
    foreach(CODE_FILE ${SHARED_CODE_FILES})
        get_source_file_property(WHERE "shared/${CODE_FILE}" LOCATION)
        set(CODE_FILES_PATHS ${CODE_FILES_PATHS} ${WHERE})
    endforeach()

    foreach(CODE_FILE ${SERVER_CODE_FILES})
        get_source_file_property(WHERE "server/${CODE_FILE}" LOCATION)
        set(CODE_FILES_PATHS ${CODE_FILES_PATHS} ${WHERE})
    endforeach()

    foreach(CODE_FILE ${CLIENT_CODE_FILES})
        get_source_file_property(WHERE "client/${CODE_FILE}" LOCATION)
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
