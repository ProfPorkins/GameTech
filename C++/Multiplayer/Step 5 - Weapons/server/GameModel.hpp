#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Entity.pb.h"
#pragma warning(pop)

#include "entities/Entity.hpp"
#include "systems/Damage.hpp"
#include "systems/Lifetime.hpp"
#include "systems/Momentum.hpp"
#include "systems/Network.hpp"

#include <SFML/Network.hpp>
#include <chrono>
#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <vector>

class GameModel
{
  public:
    void update(const std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now);
    bool initialize();
    void shutdown();

  private:
    std::unordered_set<std::uint64_t> m_clients;
    std::unordered_map<std::uint64_t, entities::Entity::IdType> m_clientToEntityId;
    entities::EntityMap m_entities;
    entities::EntityVector m_newEntities;
    entities::EntitySet m_removeEntities;

    std::unique_ptr<systems::Damage> m_systemDamage;
    std::unique_ptr<systems::Lifetime> m_systemLifetime;
    std::unique_ptr<systems::Momentum> m_systemMomentum;
    std::unique_ptr<systems::Network> m_systemNetwork;

    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(entities::Entity::IdType entityId);

    void reportAllEntities(std::uint64_t clientId);

    void handleConnect(std::uint64_t clientId);
    void handleDisconnect(std::uint64_t clientId);
    void handleJoin(std::uint64_t clientId);
    void handleNewEntity(std::shared_ptr<entities::Entity> entity);
    void handleRemoveEntity(entities::Entity::IdType entityId);
};
