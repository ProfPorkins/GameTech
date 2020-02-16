#include "GameModel.hpp"

#include "MessageQueueClient.hpp"
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
    m_viewSize = viewSize;
    //
    // Initialize the network system, including registering handlers for
    // messages the game model has responsibility.
    m_systemNetwork = std::make_unique<systems::Network>();

    m_systemNetwork->registerHandler(messages::Type::NotifyJoinSelf,
                                     [this](std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                         (void)elapsedTime; // unused parameter
                                         handleNotifyJoinSelf(std::static_pointer_cast<messages::NotifyJoinSelf>(message));
                                     });

    m_systemNetwork->registerHandler(messages::Type::UpdateEntity,
                                     [this](std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                         (void)elapsedTime; // unused parameter
                                         handleUpdateEntity(std::static_pointer_cast<messages::UpdateEntity>(message));
                                     });

    //
    // Initialize the keyboard input system.
    auto inputMapping = {
        std::make_tuple(components::Input::Type::RotateLeft, sf::Keyboard::A),
        std::make_tuple(components::Input::Type::RotateRight, sf::Keyboard::D),
        std::make_tuple(components::Input::Type::Thrust, sf::Keyboard::W)};
    m_systemKeyboardInput = std::make_unique<systems::KeyboardInput>(inputMapping);

    //
    // Initialize the renderer system.
    m_systemRender = std::make_unique<systems::Renderer>();

    return true;
}

void GameModel::signalKeyPressed(sf::Event::KeyEvent event)
{
    m_systemKeyboardInput->keyPressed(event);
}

void GameModel::signalKeyReleased(sf::Event::KeyEvent event)
{
    m_systemKeyboardInput->keyReleased(event);
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
    // Process the network system first, it is like local input, so should
    // be processed early.
    m_systemNetwork->update(elapsedTime, MessageQueueClient::instance().getMessages());

    //
    // Only have two systems right now, KeyboardInput and Rendering
    m_systemKeyboardInput->update(elapsedTime);

    //
    // Rendering must always be done last
    m_systemRender->update(elapsedTime, renderTarget);
}

// --------------------------------------------------------------
//
// As entities are added to the game model, they are run by the systems
// to see if they are interested in knowing about them during their
// updates.
//
// --------------------------------------------------------------
void GameModel::addEntity(std::shared_ptr<entities::Entity> entity)
{
    if (entity == nullptr)
        return;

    m_entities[entity->getId()] = entity;
    m_systemKeyboardInput->addEntity(entity);
    m_systemRender->addEntity(entity);
}

// --------------------------------------------------------------
//
// All entity lists for the systems must be given a chance to remove
// the entity.
//
// --------------------------------------------------------------
void GameModel::removeEntity(entities::Entity::IdType entityId)
{
    m_entities.erase(entityId);
    //
    // Let each of the systems know to remove the entity
    m_systemKeyboardInput->removeEntity(entityId);
    m_systemRender->removeEntity(entityId);
}

// --------------------------------------------------------------
//
// Handler for the NotifyJoinSelf message.  It gets a 'self' player entity
// created and added to the client game simulation.
//
// --------------------------------------------------------------
void GameModel::handleNotifyJoinSelf(std::shared_ptr<messages::NotifyJoinSelf> message)
{
    auto playerSelf = entities::createPlayerSelf(message->getPBPlayer(), m_viewSize, m_textures);
    addEntity(playerSelf);
}

void GameModel::handleUpdateEntity(std::shared_ptr<messages::UpdateEntity> message)
{
    auto& pbEntity = message->getPBEntity();
    if (m_entities.find(pbEntity.id()) != m_entities.end())
    {
        auto entity = m_entities[pbEntity.id()];
        if (entity->hasComponent<components::Position>() && pbEntity.has_position())
        {
            auto position = entity->getComponent<components::Position>();
            position->set(sf::Vector2f(pbEntity.position().center().x(), pbEntity.position().center().y()));
            position->setOrientation(pbEntity.position().orientation());
        }
    }
}
