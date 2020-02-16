#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "ClientId.pb.h"
#pragma warning(pop)

#include "Message.hpp"
#include "MessageTypes.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is send from the server to a client acknowledging
    // a connection has been made.
    //
    // -----------------------------------------------------------------
    class ConnectAck : public Message
    {
      public:
        ConnectAck() :
            Message(Type::ConnectAck)
        {
        }

        virtual std::string serializeToString() const override { return ""; }
        virtual bool parseFromString(const std::string&) override { return true; }
    };
} // namespace messages
