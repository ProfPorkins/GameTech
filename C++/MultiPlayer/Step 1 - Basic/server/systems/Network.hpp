#pragma once

#include "messages/Message.hpp"
#include "messages/Join.hpp"
#include "systems/System.hpp"

#include <cstdint>
#include <chrono>
#include <functional>
#include <memory>
#include <tuple>
#include <queue>
#include <unordered_map>

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
        Network(std::function<void(std::shared_ptr<entities::Entity>)> addEntity);

        void update(std::chrono::milliseconds elapsedTime, std::queue<std::tuple<std::uint32_t, std::shared_ptr<messages::Message>>> messages);

      private:
        std::function<void(std::shared_ptr<entities::Entity>)> m_addEntity;
        std::unordered_map<messages::Type, std::function<void(std::uint32_t, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message>)>> m_commandMap;

        void handleJoin(std::uint32_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Join> message);

    };
} // namespace systems
