#pragma once

#include "MessageTypes.hpp"

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

        Type getType() { return m_type; }

        virtual std::string serializeToString() const = 0;
        virtual bool parseFromString(const std::string& source) = 0;

      private:
        Type m_type;
    };
} // namespace messages
