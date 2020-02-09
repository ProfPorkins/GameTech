#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Player.pb.h"
#pragma warning(pop)

#include "Message.hpp"
#include "MessageTypes.hpp"
#include "entities/Entity.hpp"

#include <memory>

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is send from the server to a client after it connects,
    // informing it of the location of the player.
    //
    // -----------------------------------------------------------------
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

        const shared::Player& getPBPlayer() const { return m_pbPlayer; }

      private:
        std::shared_ptr<entities::Entity> m_player;
        shared::Player m_pbPlayer;
    };
} // namespace messages