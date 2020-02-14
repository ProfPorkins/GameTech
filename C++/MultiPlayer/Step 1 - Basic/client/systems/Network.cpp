#include "Network.hpp"

#include "MessageQueueClient.hpp"
#include "entities/PlayerShip.hpp"
#include "messages/Join.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Primary activity in the constructor is to setup the command map
    // that maps from message types to their handlers.
    //
    // --------------------------------------------------------------
    Network::Network(std::function<void(std::shared_ptr<entities::Entity>)> addEntity, std::unordered_set<std::shared_ptr<sf::Texture>>& textures, sf::Vector2f viewSize) :
        System({}),
        m_addEntity(addEntity),
        m_textures(textures),
        m_viewSize(viewSize)
    {
        //
        // Build a command map of message types to operations
        m_commandMap[messages::Type::ConnectAck] = [this](std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
            // Not completely in love with having to do a static_pointer_case, but living with it for now
            handleConnectAck(elapsedTime, std::static_pointer_cast<messages::ConnectAck>(message));
        };

        m_commandMap[messages::Type::NotifyJoinSelf] = [this](std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
            // Not completely in love with having to do a static_pointer_case, but living with it for now
            handleNotifyJoinSelf(elapsedTime, std::static_pointer_cast<messages::NotifyJoinSelf>(message));
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
            m_commandMap[message->getType()](elapsedTime, message);
        }
    }

    // --------------------------------------------------------------
    //
    // Handler for the ConnectSelf message.  It gets a 'self' player entity
    // created and added to the client game simulation.
    //
    // --------------------------------------------------------------
    void Network::handleConnectAck(std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::ConnectAck> message)
    {
        (void)elapsedTime;
        m_playerId = message->getPBPlayerId().id();
        //
        // Now, send a Join message back to the server so we can get into the game!
        MessageQueueClient::instance().sendMessage(std::make_shared<messages::Join>());
    }

    void Network::handleNotifyJoinSelf(std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::NotifyJoinSelf> message)
    {
        (void)elapsedTime;
        auto playerSelf = entities::createPlayerSelf(message->getPBPlayer(), m_viewSize, m_textures);
        m_addEntity(playerSelf);
    }

} // namespace systems
