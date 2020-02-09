#pragma once

#include "messages/ConnectSelf.hpp"
#include "messages/Message.hpp"
#include "systems/System.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/System/Vector2.hpp>
#include <chrono>
#include <functional>
#include <memory>
#include <queue>
#include <unordered_map>

namespace systems
{
    class Network : public System
    {
      public:
        Network(std::function<void(std::shared_ptr<entities::Entity>)> addEntity, std::unordered_set<std::shared_ptr<sf::Texture>>& textures, sf::Vector2f viewSize);

        void update(std::chrono::milliseconds elapsedTime, std::queue<std::shared_ptr<messages::Message>> messages);

      private:
        // TODO: This is still just a temporary hack until I get something better done
        std::unordered_set<std::shared_ptr<sf::Texture>>& m_textures;
        sf::Vector2f m_viewSize;

        std::function<void(std::shared_ptr<entities::Entity>)> m_addEntity;
        std::unordered_map<messages::Type, std::function<void(std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message>)>> m_commandMap;

        void handleConnectSelf(std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::ConnectSelf> message);
    };
} // namespace systems
