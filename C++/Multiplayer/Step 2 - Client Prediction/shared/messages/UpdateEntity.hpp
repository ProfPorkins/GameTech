#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#if defined(_MSC_VER)
    #pragma warning(push)
    #pragma warning(disable : 4127)
#endif
#include "Entity.pb.h"
#if defined(_MSC_VER)
    #pragma warning(pop)
#endif

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
    class UpdateEntity : public Message
    {
      public:
        UpdateEntity(std::shared_ptr<entities::Entity> entity) :
            Message(Type::UpdateEntity),
            m_entity(entity)
        {
        }

        UpdateEntity() :
            Message(Type::UpdateEntity)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

        const shared::Entity& getPBEntity() const { return m_pbEntity; }

      private:
        std::shared_ptr<entities::Entity> m_entity;
        shared::Entity m_pbEntity;
    };
} // namespace messages