#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "PlayerId.pb.h"
#pragma warning(pop)

#include "Message.hpp"
#include "MessageTypes.hpp"

#include <SFML/Network.hpp>

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is send from the server to a client acknowledging
    // a connection has been made.
    //
    // -----------------------------------------------------------------
    class ConnectAck : public Message
    {
      public:
        ConnectAck(sf::Uint32 playerId) :
            Message(Type::ConnectAck),
            m_playerId(playerId)
        {
        }

        ConnectAck() :
            Message(Type::ConnectAck)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

        const shared::PlayerId& getPBPlayerId() const { return m_pbPlayerId; }

      private:
        sf::Uint32 m_playerId;
        shared::PlayerId m_pbPlayerId;
    };
} // namespace messages
