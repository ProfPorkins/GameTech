#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Entity.pb.h"
#pragma warning(pop)

#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "entities/Entity.hpp"
#include "misc/math.hpp"
#include "systems/KeyboardInput.hpp"
#include "systems/Lifetime.hpp"
#include "systems/Momentum.hpp"
#include "systems/Network.hpp"
#include "systems/Renderer.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/Window/Event.hpp>
#include <chrono>
#include <memory>
#include <unordered_set>
#include <vector>

class GameModel
{
  public:
    bool initialize(math::Vector2f viewSize);

    void signalKeyPressed(sf::Event::KeyEvent event, std::chrono::microseconds elapsedTime);
    void signalKeyReleased(sf::Event::KeyEvent event, std::chrono::microseconds elapsedTime);
    void update(const std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<sf::RenderTarget> renderTarget);

  private:
    // The purpose of this is to have a container that keeps the textures alive throughout the program
    std::unordered_set<std::shared_ptr<sf::Texture>> m_textures;
    math::Vector2f m_viewSize;

    entities::EntityMap m_entities;
    entities::EntityVector m_newEntities;
    entities::EntitySet m_removeEntities;

    std::unique_ptr<systems::KeyboardInput> m_systemKeyboardInput;
    std::unique_ptr<systems::Lifetime> m_systemLifetime;
    std::unique_ptr<systems::Momentum> m_systemMomentum;
    std::unique_ptr<systems::Network> m_systemNetwork;
    std::unique_ptr<systems::Renderer> m_systemRender;

    std::shared_ptr<entities::Entity> createEntity(const shared::Entity& pbEntity);
    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(entities::Entity::IdType entityId);

    void handleNewEntity(const shared::Entity& pbEntity);
    void handleRemoveEntity(entities::Entity::IdType entityId);
};
