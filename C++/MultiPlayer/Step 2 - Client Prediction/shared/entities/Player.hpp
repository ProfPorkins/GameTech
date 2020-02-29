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
    void thrust(std::shared_ptr<entities::Entity>& entity, std::chrono::milliseconds elapsedTime);
    void rotateLeft(std::shared_ptr<entities::Entity>& entity, std::chrono::milliseconds elapsedTime);
    void rotateRight(std::shared_ptr<entities::Entity>& entity, std::chrono::milliseconds elapsedTime);
} // namespace entities::player
