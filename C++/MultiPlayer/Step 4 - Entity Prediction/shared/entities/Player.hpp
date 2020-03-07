#pragma once

#include "entities/Entity.hpp"
#include "misc/math.hpp"

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
    std::shared_ptr<Entity> create(std::string texture, math::Vector2f position, float size, float thrustRate, float rotateRate, math::Vector2f momentum);
}

namespace entities
{
    void thrust(entities::Entity* entity, std::chrono::milliseconds howLong);
    void rotateLeft(entities::Entity* entity, std::chrono::milliseconds howLong);
    void rotateRight(entities::Entity* entity, std::chrono::milliseconds howLong);
    void drift(entities::Entity* entity, std::chrono::milliseconds howLong);
} // namespace entities
