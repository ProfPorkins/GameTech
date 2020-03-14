#pragma once

#include "components/Input.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "entities/Entity.hpp"
#include "messages/ConnectAck.hpp"
#include "messages/Message.hpp"
#include "messages/UpdateEntity.hpp"
#include "systems/System.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/System/Vector2.hpp>
#include <chrono>
#include <cstdint>
#include <functional>
#include <memory>
#include <queue>
#include <unordered_map>
#include <unordered_set>

namespace systems
{
    // --------------------------------------------------------------
    //
    // This system is used to process network messages that come from
    // the server.
    //
    // --------------------------------------------------------------
    class Network : public System
    {
      public:
        Network();

        void registerNewEntityHandler(std::function<void(const shared::Entity&)> handler) { m_newEntityHandler = handler; }
        void registerRemoveEntityHandler(std::function<void(entities::Entity::IdType)> handler) { m_removeEntityHandler = handler; }
        void registerHandler(messages::Type type, std::function<void(std::chrono::microseconds, const std::chrono::system_clock::time_point now, std::shared_ptr<messages::Message>)> handler);
        void update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::queue<std::shared_ptr<messages::Message>> messages);

      private:
        std::unordered_map<messages::Type, std::function<void(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<messages::Message>)>> m_commandMap;
        std::function<void(entities::Entity::IdType)> m_removeEntityHandler{nullptr};
        std::function<void(const shared::Entity&)> m_newEntityHandler{nullptr};
        std::uint32_t m_lastMessageId{0};

        entities::EntitySet m_updatedEntities;

        void handleConnectAck(std::shared_ptr<messages::ConnectAck> message);
        void handleUpdateEntity(std::shared_ptr<messages::UpdateEntity> message, const std::chrono::system_clock::time_point now);
    };
} // namespace systems
