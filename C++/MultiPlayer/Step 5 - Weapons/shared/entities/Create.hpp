#pragma once

#include "entities/Entity.hpp"
#include "misc/math.hpp"

#include <chrono>
#include <memory>
#include <string>

// --------------------------------------------------------------
//
// Function to create a player entity
//
// --------------------------------------------------------------
namespace entities::player
{
    std::shared_ptr<Entity> create(std::string texture, math::Vector2f position, float size, float thrustRate, float rotateRate, math::Vector2f momentum, float health);
}
// --------------------------------------------------------------
//
// Function to create an explosion entity
//
// --------------------------------------------------------------
namespace entities::explosion
{
    std::shared_ptr<Entity> create(std::string texture, math::Vector2f position, float size, std::vector<std::chrono::milliseconds> spriteTime);
}