#include "Network.hpp"

#include "MessageQueueServer.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Process all outstanding messages since the last update.
    //
    // --------------------------------------------------------------
    void Network::update(std::chrono::milliseconds elapsedTime, std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> messages)
    {
        while (!messages.empty())
        {
            auto [clientId, message] = messages.front();
            messages.pop();
            auto entry = m_commandMap.find(message->getType());
            if (entry != m_commandMap.end())
            {
                auto& [type, handler] = *entry;
                handler(clientId, elapsedTime, message);
            }
        }
    }

    // --------------------------------------------------------------
    //
    // Allow message handlers to be registered.
    //
    // --------------------------------------------------------------
    void Network::registerHandler(messages::Type type, std::function<void(std::uint64_t, std::chrono::milliseconds, std::shared_ptr<messages::Message>)> handler)
    {
        m_commandMap[type] = handler;
    }

    // --------------------------------------------------------------
    //
    // Handler for the Input message.  This simply passes the responsibility
    // to the registered input handler.
    //
    // --------------------------------------------------------------
    void Network::handleInput(std::shared_ptr<messages::Input> message)
    {
        if (m_inputHandler)
        {
            auto entityId = message->getPBInput().entityid();
            auto entity = m_entities[entityId];

            for (auto&& input : message->getPBInput().input())
            {
                m_inputHandler(entity, input.type(), std::chrono::milliseconds(input.elapsedtime()));
            }
        }
    }
} // namespace systems
