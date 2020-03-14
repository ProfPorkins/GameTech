#pragma once

#include "MessageTypes.hpp"

#include <chrono>
#include <optional>
#include <string>

namespace messages
{
    // -----------------------------------------------------------------
    //
    // A network message types must derive from this class and provide the
    // specified interface (to use Google Protocol Buffers for serialization
    // and deserialization).
    //
    // -----------------------------------------------------------------
    class Message
    {
      public:
        Message(Type type) :
            m_type(type)
        {
        }

        void setMessageId(std::uint32_t messageId) { m_messageId = messageId; }
        auto getMessageId() { return m_messageId; }
        Type getType() { return m_type; }

        virtual std::string serializeToString() const = 0;
        virtual bool parseFromString(const std::string& source) = 0;

      protected:
        std::optional<std::uint32_t> m_messageId;

      private:
        Type m_type;
    };
} // namespace messages
