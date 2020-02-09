#pragma once

#include "MessageTypes.hpp"

#include <optional>
#include <string>

namespace messages
{
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
