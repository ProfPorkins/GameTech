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
    // This message is send from the server to a client after it sends
    // a join request.
    //
    // -----------------------------------------------------------------
    class NotifyJoinSelf : public Message
    {
      public:
        NotifyJoinSelf(std::shared_ptr<entities::Entity> player) :
            Message(Type::ConnectAck),
            m_player(player)
        {
        }
        NotifyJoinSelf() :
            Message(Type::ConnectAck)
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