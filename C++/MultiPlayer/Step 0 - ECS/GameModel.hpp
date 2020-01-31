#pragma once

#include "entities/Entity.hpp"
#include "systems/KeyboardInput.hpp"
#include "systems/Renderer.hpp"

#include <SFML/Graphics.hpp>
#include <chrono>
#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <utility>

class GameModel
{
  public:
    bool initialize(sf::Vector2f viewSize);
    void update(const std::chrono::milliseconds elapsedTime, std::shared_ptr<sf::RenderTarget> renderTarget);

  private:
    // The purpose of this is to have a container that keeps the textures alive throughout the program
    std::unordered_set<std::shared_ptr<sf::Texture>> m_textures;

    EntityMap m_entities;
    EntityMap m_entitiesKeyboardInput;
    EntityMap m_entitiesRenderable;

    std::unique_ptr<KeyboardInput> m_systemKeyboardInput;
    std::unique_ptr<Renderer> m_systemRender;

    void addEntity(std::shared_ptr<Entity> entity);
    void removeEntity(decltype(Entity().getId()) entityId);
};
