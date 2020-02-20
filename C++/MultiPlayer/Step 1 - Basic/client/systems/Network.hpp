#pragma once

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

        void update(std::chrono::milliseconds elapsedTime, std::queue<std::shared_ptr<messages::Message>> messages);
        void registerHandler(messages::Type type, std::function<void(std::chrono::milliseconds, std::shared_ptr<messages::Message>)> handler);

      private:
        std::unordered_map<messages::Type, std::function<void(std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message>)>> m_commandMap;

        void handleConnectAck(std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::ConnectAck> message);
        void handleUpdateEntity(std::shared_ptr<messages::UpdateEntity> message);
    };
} // namespace systems
