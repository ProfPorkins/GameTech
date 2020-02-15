#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Input.pb.h"
#pragma warning(pop)

#include "Message.hpp"
#include "MessageTypes.hpp"
#include "components/Input.hpp"

#include <SFML/Network.hpp>
#include <chrono>

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is send from a client to the server informing it of
    // a user input event.
    //
    // -----------------------------------------------------------------
    class Input : public Message
    {
      public:
        Input(components::Input::Type type, std::chrono::milliseconds elapsedTime) :
            Message(Type::Input),
            m_type(type),
            m_elapsedTime(elapsedTime)
        {
        }

        Input() :
            Message(Type::Input)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

        const shared::Input& getPBInput() const { return m_pbInput; }

      private:
        components::Input::Type m_type;
        std::chrono::milliseconds m_elapsedTime;

        shared::Input m_pbInput;
    };
} // namespace messages
