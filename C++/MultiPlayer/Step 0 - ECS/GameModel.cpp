#include "GameModel.hpp"

#include "components/Input.hpp"
#include "entities/PlayerShip.hpp"

#include <SFML/System/Vector2.hpp>
#include <SFML/Window/Keyboard.hpp>
#include <memory>
#include <tuple>

// --------------------------------------------------------------
//
// This is where all game model initialization occurs.  In the case
// of this "game', start by initializing the systems and then
// loading the art assets.
//
// --------------------------------------------------------------
bool GameModel::initialize(sf::Vector2f viewSize)
{
    //
    // Initialize the various sytems
    auto inputMapping = {
        std::make_tuple(components::Input::Type::TurnLeft, sf::Keyboard::A),
        std::make_tuple(components::Input::Type::TurnRight, sf::Keyboard::D),
        std::make_tuple(components::Input::Type::Forward, sf::Keyboard::W)};
    m_systemKeyboardInput = std::make_unique<KeyboardInput>(inputMapping);
    m_systemRender = std::make_unique<Renderer>();

    //
    // Create the space ship entities we'll use for the players
    addEntity(entities::createPlayerShip("assets/playerShip1_blue.png", viewSize, sf::Vector2f(-0.25f, 0.0f), 0.05f, m_textures));
    addEntity(entities::createPlayerShip("assets/playerShip1_red.png", viewSize, sf::Vector2f(0.25f, 0.0f), 0.05f, m_textures));

    return true;
}

// --------------------------------------------------------------
//
// This is where everything performs its update.  The very last
// update must be the render, because all other game state updates
// must complete before rendering can start.
//
// --------------------------------------------------------------
void GameModel::update(const std::chrono::milliseconds elapsedTime, std::shared_ptr<sf::RenderTarget> renderTarget)
{
    //
    // Only have two systems right now, KeyboardInput and Rendering
    m_systemKeyboardInput->update(elapsedTime, m_entitiesKeyboardInput);

    //
    // Rendering must always be done last
    m_systemRender->update(elapsedTime, m_entitiesRenderable, renderTarget);
}

// --------------------------------------------------------------
//
// As entities are added to the game model, they are run by the systems
// to see if they are interested in knowing about them during their
// updates.
//
// Question: Should the systems keep the list of entities themselves
//           rather than the game model keeping the lists?
//
// --------------------------------------------------------------
void GameModel::addEntity(std::shared_ptr<Entity> entity)
{
    if (entity == nullptr)
        return;

    m_entities[entity->getId()] = entity;

    if (m_systemKeyboardInput->isInterested(entity.get()))
    {
        m_entitiesKeyboardInput[entity->getId()] = entity;
    }

    if (m_systemRender->isInterested(entity.get()))
    {
        m_entitiesRenderable[entity->getId()] = entity;
    }
}

// --------------------------------------------------------------
//
// All entity lists for the systems must be given a chance to remove
// the entity.
//
// --------------------------------------------------------------
void GameModel::removeEntity(decltype(Entity().getId()) entityId)
{
    m_entities.erase(entityId);
    m_entitiesKeyboardInput.erase(entityId);
    m_entitiesRenderable.erase(entityId);
}
