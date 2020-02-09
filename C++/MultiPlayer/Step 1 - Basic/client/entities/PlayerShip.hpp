#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Player.pb.h"
#pragma warning(pop)

#include "entities/Entity.hpp"

#include <SFML/Graphics/Texture.hpp>
#include <SFML/System/Vector2.hpp>
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
    std::shared_ptr<Entity> createPlayerSelf(const shared::Player& pbPlayer, sf::Vector2f viewSize, std::unordered_set<std::shared_ptr<sf::Texture>>& textures);
} // namespace entities
