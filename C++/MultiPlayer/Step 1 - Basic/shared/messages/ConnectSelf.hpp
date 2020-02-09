#pragma once

#include "Message.hpp"
#include "MessageTypes.hpp"
#include "entities/Entity.hpp"

#include <memory>

namespace messages
{
    class ConnectSelf : public Message
    {
      public:
        ConnectSelf(std::shared_ptr<entities::Entity> player) :
            Message(Type::ConnectSelf),
            m_player(player)
        {
        }
        ConnectSelf() :
            Message(Type::ConnectSelf)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

      private:
        std::shared_ptr<entities::Entity> m_player;
    };
} // namespace messages