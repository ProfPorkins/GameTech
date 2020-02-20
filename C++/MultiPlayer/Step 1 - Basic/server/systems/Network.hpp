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
        Network() :
            System({ctti::unnamed_type_id<components::Position>(),
                    ctti::unnamed_type_id<components::Movement>()})
        {
            //
            // Register out own join handler
            registerHandler(messages::Type::Join,
                            [this](std::uint64_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                (void)elapsedTime; // unused parameter
                                (void)message;     // unused parameter
                                if (m_joinHandler)
                                {
                                    m_joinHandler(clientId);
                                }
                            });

            //
            // Register our own input handler
            registerHandler(messages::Type::Input,
                            [this](std::uint64_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                (void)clientId;    // unused parameter
                                (void)elapsedTime; // unused parameter
                                handleInput(std::static_pointer_cast<messages::Input>(message));
                            });
        }

        void registerJoinHandler(std::function<void(std::uint64_t clientId)> handler) { m_joinHandler = handler; }
        void registerInputHandler(std::function<void(std::shared_ptr<entities::Entity>&, shared::InputType, std::chrono::milliseconds)> handler) { m_inputHandler = handler; }
        void update(std::chrono::milliseconds elapsedTime, std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> messages);

      private:
        std::unordered_map<messages::Type, std::function<void(std::uint64_t, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message>)>> m_commandMap;
        std::function<void(std::uint64_t clientId)> m_joinHandler = nullptr;
        std::function<void(std::shared_ptr<entities::Entity>&, shared::InputType, std::chrono::milliseconds)> m_inputHandler = nullptr;

        void registerHandler(messages::Type type, std::function<void(std::uint64_t, std::chrono::milliseconds, std::shared_ptr<messages::Message>)> handler);
        void handleInput(std::shared_ptr<messages::Input> message);
    };
} // namespace systems
