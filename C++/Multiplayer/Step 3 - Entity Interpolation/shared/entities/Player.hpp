#pragma once

#include "entities/Entity.hpp"

#include <SFML/System/Vector2.hpp>
#include <chrono>
#include <memory>
#include <string>

// --------------------------------------------------------------
//
// This is actually a player ship factory, creating an entity
// and assigning the appropiate components to it.
//
// --------------------------------------------------------------
namespace entities::player
{
    std::shared_ptr<Entity> create(std::string texture, sf::Vector2f position, float size, float speed, float rotateRate);
}

namespace entities
{
    void thrust(entities::Entity* entity, std::chrono::milliseconds elapsedTime);
    void rotateLeft(entities::Entity* entity, std::chrono::milliseconds elapsedTime);
    void rotateRight(entities::Entity* entity, std::chrono::milliseconds elapsedTime);
} // namespace entities
