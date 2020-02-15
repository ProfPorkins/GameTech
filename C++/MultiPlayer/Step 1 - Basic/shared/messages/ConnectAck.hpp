#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "ClientId.pb.h"
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
        ConnectAck(std::uint32_t clientId) :
            Message(Type::ConnectAck),
            m_clientId(clientId)
        {
        }

        ConnectAck() :
            Message(Type::ConnectAck)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

        const shared::ClientId& getPbClientIdId() const { return m_pbClientId; }

      private:
          std::uint32_t m_clientId;
        shared::ClientId m_pbClientId;
    };
} // namespace messages
