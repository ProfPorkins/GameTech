#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "EntityId.pb.h"
#pragma warning(pop)

#include "Message.hpp"
#include "MessageTypes.hpp"
#include "entities/Entity.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is send from the server to a client to inform it to
    // remove an entity from its simulation.
    //
    // -----------------------------------------------------------------
    class RemoveEntity : public Message
    {
      public:
        RemoveEntity(entities::Entity::IdType entityId) :
            Message(Type::RemoveEntity),
            m_entityId(entityId)
        {
        }
        RemoveEntity() :
            Message(Type::RemoveEntity)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

        const shared::EntityId& getPBEntity() const { return m_pbEntity; }

      private:
        entities::Entity::IdType m_entityId{0};
        shared::EntityId m_pbEntity;
    };
} // namespace messages