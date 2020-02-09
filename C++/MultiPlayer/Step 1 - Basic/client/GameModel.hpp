#pragma once

#include "MessageQueueClient.hpp"
#include "entities/Entity.hpp"
#include "systems/KeyboardInput.hpp"
#include "systems/Network.hpp"
#include "systems/Renderer.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/Window/Event.hpp>
#include <chrono>
#include <memory>
#include <unordered_set>

class GameModel
{
  public:
    bool initialize(sf::Vector2f viewSize);
    bool initializeMessageQueue(std::string serverIP, std::uint16_t serverPort);

    void signalKeyPressed(sf::Event::KeyEvent event);
    void signalKeyReleased(sf::Event::KeyEvent event);
    void update(const std::chrono::milliseconds elapsedTime, std::shared_ptr<sf::RenderTarget> renderTarget);

  private:
    std::unique_ptr<MessageQueueClient> m_mq;
    // The purpose of this is to have a container that keeps the textures alive throughout the program
    std::unordered_set<std::shared_ptr<sf::Texture>> m_textures;

    entities::EntityMap m_entities;
    entities::EntityMap m_entitiesKeyboardInput;
    entities::EntityMap m_entitiesRenderable;

    std::unique_ptr<systems::Network> m_systemNetwork;
    std::unique_ptr<systems::KeyboardInput> m_systemKeyboardInput;
    std::unique_ptr<systems::Renderer> m_systemRender;

    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(decltype(entities::Entity().getId()) entityId);
};
