#pragma once

#include "entities/Entity.hpp"
#include "systems/Network.hpp"

#include <SFML/Network.hpp>
#include <chrono>
#include <memory>
#include <unordered_set>

class GameModel
{
  public:
    void update(const std::chrono::milliseconds elapsedTime);
    bool initialize();
    void shutdown();

  private:
    std::unordered_set<sf::Uint32> m_players;
    entities::EntityMap m_entities;

    std::unique_ptr<systems::Network> m_systemNetwork;

    void clientConnected(sf::Uint32 clientId);
    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(decltype(entities::Entity().getId()) entityId);
};
