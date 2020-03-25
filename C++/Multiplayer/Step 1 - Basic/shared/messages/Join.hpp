#pragma once

#include "Message.hpp"
#include "MessageTypes.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is sent from the server to join the game.  There is
    // no content in the messsage, because the message itself is the information.
    //
    // -----------------------------------------------------------------
    class Join : public Message
    {
      public:
        Join() :
            Message(Type::Join)
        {
        }

        virtual std::string serializeToString() const override { return ""; }
        virtual bool parseFromString(const std::string&) override { return true; }
    };
} // namespace messages
