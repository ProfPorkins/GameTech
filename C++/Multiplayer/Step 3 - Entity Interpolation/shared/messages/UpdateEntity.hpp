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

#include <chrono>
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
        UpdateEntity(std::shared_ptr<entities::Entity> entity, const std::chrono::milliseconds updateWindow) :
            Message(Type::UpdateEntity),
            m_entity(entity),
            m_updateWindow(updateWindow)
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
        std::chrono::milliseconds m_updateWindow{0};
        shared::Entity m_pbEntity;
    };
} // namespace messages