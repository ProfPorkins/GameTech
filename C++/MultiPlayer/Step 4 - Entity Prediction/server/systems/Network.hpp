#pragma once

#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "messages/Input.hpp"
#include "messages/Join.hpp"
#include "messages/Message.hpp"
#include "systems/System.hpp"

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
    // connected clients.
    //
    // --------------------------------------------------------------
    class Network : public System
    {
      public:
        Network();

        void registerJoinHandler(std::function<void(std::uint64_t clientId)> handler) { m_joinHandler = handler; }
        void update(std::chrono::microseconds elapsedTime, std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> messages);

      private:
        std::unordered_map<messages::Type, std::function<void(std::uint64_t, std::chrono::microseconds elapsedTime, std::shared_ptr<messages::Message>)>> m_commandMap;
        std::function<void(std::uint64_t)> m_joinHandler{nullptr};
        std::unordered_set<entities::Entity::IdType> m_reportThese;

        void registerHandler(messages::Type type, std::function<void(std::uint64_t, std::chrono::microseconds, std::shared_ptr<messages::Message>)> handler);
        void handleInput(std::shared_ptr<messages::Input> message);
        void updateClients(const std::chrono::microseconds elapsedTime);
    };
} // namespace systems
