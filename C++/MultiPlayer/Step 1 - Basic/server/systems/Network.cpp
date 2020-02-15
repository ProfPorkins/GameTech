#include "Network.hpp"

#include "MessageQueueServer.hpp"
#include "entities/Player.hpp"
#include "messages/NotifyJoinSelf.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Primary activity in the constructor is to setup the command map
    // that maps from message types to their handlers.
    //
    // --------------------------------------------------------------
    Network::Network(std::function<void(std::shared_ptr<entities::Entity>)> addEntity) :
        System({}),
        m_addEntity(addEntity)
    {

        //
        // Build a command map of message types to operations
        m_commandMap[messages::Type::Join] = [this](std::uint32_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
            // Not completely in love with having to do a static_pointer_case, but living with it for now
            handleJoin(clientId, elapsedTime, std::static_pointer_cast<messages::Join>(message));
        };
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
            m_commandMap[message->getType()](clientId, elapsedTime, message);
        }
    }

    // --------------------------------------------------------------
    //
    // Handler for the Join message.  It gets a player entity created,
    // added to the server game model, and notifies the requesting client
    // of the player.
    //
    // --------------------------------------------------------------
    void Network::handleJoin(std::uint32_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Join> message)
    {
        (void)elapsedTime;
        // Generate a player, add to server simulation, and send to the client
        auto player = entities::createPlayer(sf::Vector2f(0.0f, 0.0f), 0.05f, 0.0002f, 180.0f / 1000);
        m_addEntity(player);

        MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::NotifyJoinSelf>(player));
    }

} // namespace systems
