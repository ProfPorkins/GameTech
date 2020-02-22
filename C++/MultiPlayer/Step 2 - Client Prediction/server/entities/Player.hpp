#pragma once

#include "entities/Entity.hpp"

#include <SFML/System/Vector2.hpp>
#include <memory>
#include <string>

// --------------------------------------------------------------
//
// This is actually a player ship factory, creating an entity
// and assigning the appropiate components to it.
//
// --------------------------------------------------------------
namespace entities
{
    std::shared_ptr<Entity> createPlayer(std::string texture, sf::Vector2f position, float size, float speed, float rotateRate);
}
