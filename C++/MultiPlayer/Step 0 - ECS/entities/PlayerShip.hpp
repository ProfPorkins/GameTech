#pragma once

#include "entities/Entity.hpp"

#include <SFML/System/Vector2.hpp>
#include <SFML/Graphics/Texture.hpp>
#include <memory>
#include <string>
#include <unordered_set>

// --------------------------------------------------------------
//
// This is actually a player ship factory, creating an entity
// and assigning the appropiate components to it.
//
// --------------------------------------------------------------
namespace entities
{
    std::shared_ptr<Entity> createPlayerShip(std::string textureFile, sf::Vector2f viewSize, sf::Vector2f position, float size, std::unordered_set<std::shared_ptr<sf::Texture>>& textures);
}
