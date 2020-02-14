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
        ConnectAck,
        Join,
        NotifyJoinSelf,
        NotifyJoinOther,
        DisconnectOther,
        UpdateSelf,
        UpdateOther,
        Input
    };
} // namespace messages
