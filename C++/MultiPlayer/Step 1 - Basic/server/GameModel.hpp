#pragma once

#include "entities/Entity.hpp"
#include "messages/Join.hpp"
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
    std::unordered_set<std::uint32_t> m_players;
    entities::EntityMap m_entities;

    std::unique_ptr<systems::Network> m_systemNetwork;

    void clientConnected(std::uint32_t clientId);
    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(decltype(entities::Entity().getId()) entityId);

    void handleJoin(std::uint32_t clientId, std::shared_ptr<messages::Join> message);
};
