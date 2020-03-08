#pragma once

#include "entities/Entity.hpp"
#include "misc/math.hpp"

#include <chrono>
#include <memory>
#include <string>
#include <vector>

// --------------------------------------------------------------
//
// This is an explosion factory, creating an entity and assigning
// the appropiate components to it.
//
// --------------------------------------------------------------
namespace entities::explosion
{
    std::shared_ptr<Entity> create(std::string texture, math::Vector2f position, float size, std::vector<std::chrono::milliseconds> spriteTime, math::Vector2f momentum);
}
