#pragma once

#include "entities/Entity.hpp"

#include <SFML/Network.hpp>
#include <chrono>
#include <memory>
#include <mutex>
#include <unordered_map>

class GameModel
{
  public:
    void update(const std::chrono::milliseconds elapsedTime);

    void clientConnected(std::unique_ptr<sf::TcpSocket> socket);

  private:
    std::mutex m_mutexSockets;
    std::unordered_map<sf::Uint32, std::unique_ptr<sf::TcpSocket>> m_sockets;
    entities::EntityMap m_entities;

    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(decltype(entities::Entity().getId()) entityId);
};
