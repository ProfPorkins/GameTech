#pragma once

#include "messages/Message.hpp"
#include "systems/System.hpp"

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
    // connected clients.
    //
    // --------------------------------------------------------------
    class Network : public System
    {
      public:
        Network();

        void update(std::chrono::milliseconds elapsedTime, std::queue<std::tuple<std::uint32_t, std::shared_ptr<messages::Message>>> messages);
        void registerHandler(messages::Type type, std::function<void(std::uint32_t, std::chrono::milliseconds, std::shared_ptr<messages::Message>)> handler);

      private:
        std::unordered_map<messages::Type, std::function<void(std::uint32_t, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message>)>> m_commandMap;
    };
} // namespace systems
