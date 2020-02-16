#pragma once

#include "Message.hpp"
#include "MessageTypes.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is send from the server to join the game.
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
