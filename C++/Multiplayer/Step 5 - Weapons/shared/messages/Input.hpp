#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Input.pb.h"
#pragma warning(pop)

#include "Message.hpp"
#include "MessageTypes.hpp"
#include "components/Input.hpp"
#include "entities/Entity.hpp"

#include <SFML/Network.hpp>
#include <chrono>
#include <cstdint>
#include <vector>

namespace messages
{
    // -----------------------------------------------------------------
    //
    // This message is send from a client to the server informing it of
    // a user input event.
    //
    // -----------------------------------------------------------------
    class Input : public Message
    {
      public:
        Input(entities::Entity::IdType id, std::vector<components::Input::Type> inputs, std::chrono::microseconds elapsedTime) :
            Message(Type::Input),
            m_entityId(id),
            m_inputs(inputs),
            m_elapsedTime(elapsedTime)
        {
        }

        Input() :
            Message(Type::Input),
            m_elapsedTime(0)
        {
        }

        virtual std::string serializeToString() const override;
        virtual bool parseFromString(const std::string& source) override;

        // Client use only! Could make these friend only methods
        entities::Entity::IdType getEntityId() { return m_entityId; }
        const std::vector<components::Input::Type> getInputs() { return m_inputs; }
        std::chrono::microseconds getElapsedTime() { return m_elapsedTime; }

        // Intended for server-side use
        const shared::Input& getPBInput() const { return m_pbInput; }

      private:
        entities::Entity::IdType m_entityId{0};
        std::vector<components::Input::Type> m_inputs;
        std::chrono::microseconds m_elapsedTime;

        shared::Input m_pbInput;
    };
} // namespace messages
