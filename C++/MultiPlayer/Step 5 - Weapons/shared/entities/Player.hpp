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
    std::shared_ptr<Entity> create(std::string texture, math::Vector2f position, float size, float thrustRate, float rotateRate, math::Vector2f momentum, float health);
}

namespace entities
{
    const float PI = 3.14159f;
    const float DEGREES_TO_RADIANS = PI / 180.0f;

    void thrust(entities::Entity* entity, std::chrono::microseconds howLong);
    void rotateLeft(entities::Entity* entity, std::chrono::microseconds howLong);
    void rotateRight(entities::Entity* entity, std::chrono::microseconds howLong);
    std::shared_ptr<Entity> fireWeapon(entities::Entity* entity);
    void drift(entities::Entity* entity, std::chrono::microseconds howLong);
} // namespace entities
