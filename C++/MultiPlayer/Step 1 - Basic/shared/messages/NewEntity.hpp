#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Entity.pb.h"
#pragma warning(pop)

#include "Message.hpp"
#include "MessageTypes.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is send from the server to a client to inform it of
    // a new entity to add to its model.
    //
    // -----------------------------------------------------------------
    class NewEntity : public Message
    {
      public:
        NewEntity(shared::Entity entity) :
            Message(Type::NewEntity),
            m_pbEntity(entity)
        {
        }
        NewEntity() :
            Message(Type::NewEntity)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

        const shared::Entity& getPBEntity() const { return m_pbEntity; }

      private:
        shared::Entity m_pbEntity;
    };
} // namespace messages