#include "Network.hpp"

#include "MessageQueueServer.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Not much
    //
    // --------------------------------------------------------------
    Network::Network() :
        System({})
    {
    }

    // --------------------------------------------------------------
    //
    // Process all outstanding messages since the last update.
    //
    // --------------------------------------------------------------
    void Network::update(std::chrono::milliseconds elapsedTime, std::queue<std::tuple<std::uint32_t, std::shared_ptr<messages::Message>>> messages)
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
    // Allow handlers for messages to be registered.
    //
    // --------------------------------------------------------------
    void Network::registerHandler(messages::Type type, std::function<void(std::uint32_t, std::chrono::milliseconds, std::shared_ptr<messages::Message>)> handler)
    {
        m_commandMap[type] = handler;
    }
} // namespace systems
