#include "Network.hpp"

#include "MessageQueueClient.hpp"
#include "messages/Join.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Primary activity in the constructor is to setup the command map
    // that maps from message types to their handlers.
    //
    // --------------------------------------------------------------
    Network::Network() :
        System({})
    {
        //
        // We know how to privately handle these messages
        m_commandMap[messages::Type::ConnectAck] = [this](std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
            // Not completely in love with having to do a static_pointer_case, but living with it for now
            handleConnectAck(elapsedTime, std::static_pointer_cast<messages::ConnectAck>(message));
        };
    }

    // --------------------------------------------------------------
    //
    // Process all outstanding messages since the last update.
    //
    // --------------------------------------------------------------
    void Network::update(std::chrono::milliseconds elapsedTime, std::queue<std::shared_ptr<messages::Message>> messages)
    {
        while (!messages.empty())
        {
            auto message = messages.front();
            messages.pop();
            auto entry = m_commandMap.find(message->getType());
            if (entry != m_commandMap.end())
            {
                auto& [type, handler] = *entry;
                handler(elapsedTime, message);
            }
        }
    }

    // --------------------------------------------------------------
    //
    // Allow handlers for messages to be registered.
    //
    // --------------------------------------------------------------
    void Network::registerHandler(messages::Type type, std::function<void(std::chrono::milliseconds, std::shared_ptr<messages::Message>)> handler)
    {
        m_commandMap[type] = handler;
    }

    // --------------------------------------------------------------
    //
    // Handler for the ConnectAck message.  This records the clientId
    // assigned to it by the server, it also sends a request to the server
    // to join the game.
    //
    // --------------------------------------------------------------
    void Network::handleConnectAck(std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::ConnectAck> message)
    {
        (void)elapsedTime;
        //
        // Now, send a Join message back to the server so we can get into the game!
        MessageQueueClient::instance().sendMessage(std::make_shared<messages::Join>());
    }

} // namespace systems
