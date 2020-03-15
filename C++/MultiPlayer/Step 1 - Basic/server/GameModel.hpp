#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Entity.pb.h"
#pragma warning(pop)

#include "entities/Entity.hpp"
#include "systems/Network.hpp"

#include <SFML/Network.hpp>
#include <chrono>
#include <memory>
#include <unordered_map>
#include <unordered_set>

class GameModel
{
  public:
    void update(const std::chrono::milliseconds elapsedTime);
    bool initialize();
    void shutdown();

  private:
    std::unordered_set<std::uint64_t> m_clients;
    std::unordered_map<std::uint64_t, entities::Entity::IdType> m_clientToEntityId;
    entities::EntityMap m_entities;
    std::unordered_set<entities::Entity::IdType> m_reportThese;

    std::unique_ptr<systems::Network> m_systemNetwork;

    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(entities::Entity::IdType entityId);

    void updateClients();
    void reportAllEntities(std::uint64_t clientId);

    void handleConnect(std::uint64_t clientId);
    void handleDisconnect(std::uint64_t clientId);
    void handleJoin(std::uint64_t clientId);
    void handleInput(std::shared_ptr<entities::Entity>& entity, shared::InputType type, std::chrono::milliseconds elapsedTime);
};
