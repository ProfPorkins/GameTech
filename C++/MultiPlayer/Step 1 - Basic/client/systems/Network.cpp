#include "Network.hpp"

#include "entities/PlayerShip.hpp"

namespace systems
{
    Network::Network(std::function<void(std::shared_ptr<entities::Entity>)> addEntity, std::unordered_set<std::shared_ptr<sf::Texture>>& textures, sf::Vector2f viewSize) :
        System({}),
        m_addEntity(addEntity),
        m_textures(textures),
        m_viewSize(viewSize)
    {
        //
        // Build a command map of message types to operations
        m_commandMap[messages::Type::ConnectSelf] = [this](std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
            // Not completely in love with having to do a static_pointer_case, but living with it for now
            handleConnectSelf(elapsedTime, std::static_pointer_cast<messages::ConnectSelf>(message));
        };
    }

    void Network::update(std::chrono::milliseconds elapsedTime, std::queue<std::shared_ptr<messages::Message>> messages)
    {
        (void)elapsedTime;

        while (!messages.empty())
        {
            auto message = messages.front();
            messages.pop();
            auto type2 = message->getType();
            m_commandMap[message->getType()](elapsedTime, message);
        }
    }

    void Network::handleConnectSelf(std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::ConnectSelf> message)
    {
        auto playerSelf = entities::createPlayerSelf(message->getPBPlayer(), m_viewSize, m_textures);
        m_addEntity(playerSelf);
    }

} // namespace systems
