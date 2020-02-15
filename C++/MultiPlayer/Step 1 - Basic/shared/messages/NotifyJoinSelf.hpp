#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Entity.pb.h"
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
            Message(Type::NotifyJoinSelf),
            m_player(player)
        {
        }
        NotifyJoinSelf() :
            Message(Type::NotifyJoinSelf)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

        const shared::Entity& getPBPlayer() const { return m_pbPlayer; }

      private:
        std::shared_ptr<entities::Entity> m_player;
        shared::Entity m_pbPlayer;
    };
} // namespace messages