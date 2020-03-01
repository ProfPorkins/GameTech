#pragma once

#include <cstdint>

namespace messages
{
    // -----------------------------------------------------------------
    //
    // @details These are the types of messages that can be sent throughout
    // the system.
    //
    // -----------------------------------------------------------------
    enum class Type : std::uint8_t
    {
        ConnectAck,   // Server to client
        NewEntity,    // Server to client
        UpdateEntity, // Server to client
        RemoveEntity, // Server to client
        Join,         // Client to server
        Input         // Client to server
    };
} // namespace messages
