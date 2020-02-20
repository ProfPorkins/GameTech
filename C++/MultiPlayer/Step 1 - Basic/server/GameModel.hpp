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
    std::unordered_set<std::uint64_t> m_clients;
    entities::EntityMap m_entities;
    std::unordered_set<entities::Entity::IdType> m_reportThese;

    std::unique_ptr<systems::Network> m_systemNetwork;

    void clientConnected(std::uint64_t clientId);
    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(entities::Entity::IdType entityId);

    void updateClients();
    void handleJoin(std::uint64_t clientId);
    void handleInput(std::shared_ptr<entities::Entity>& entity, shared::InputType type, std::chrono::milliseconds elapsedTime);
};
