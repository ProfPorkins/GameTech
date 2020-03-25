#pragma once

#include "entities/Entity.hpp"

#include <chrono>
#include <memory>
#include <string>

namespace entities
{
    const float PI = 3.14159f;
    const float DEGREES_TO_RADIANS = PI / 180.0f;

    void thrust(entities::Entity* entity, std::chrono::microseconds howLong);
    void rotateLeft(entities::Entity* entity, std::chrono::microseconds howLong);
    void rotateRight(entities::Entity* entity, std::chrono::microseconds howLong);
    std::shared_ptr<Entity> fireWeapon(entities::Entity* entity, std::chrono::microseconds elapsedTime);
    void drift(entities::Entity* entity, std::chrono::microseconds howLong);
} // namespace entities
