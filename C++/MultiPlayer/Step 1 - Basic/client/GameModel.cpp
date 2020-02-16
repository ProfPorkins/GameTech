#include "GameModel.hpp"

#include "MessageQueueClient.hpp"
#include "components/Input.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Sprite.hpp"

#include <SFML/Graphics/Texture.hpp>
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

    m_systemNetwork->registerHandler(messages::Type::NewEntity,
                                     [this](std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                         (void)elapsedTime; // unused parameter
                                         handleNewEntity(std::static_pointer_cast<messages::NewEntity>(message));
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
// Based upon an Entity received from the server, create the
// entity at the client.
//
// --------------------------------------------------------------
std::shared_ptr<entities::Entity> GameModel::createEntity(const shared::Entity& pbEntity)
{
    // Server provided the entity id, so use it
    std::shared_ptr<entities::Entity> entity = std::make_shared<entities::Entity>(pbEntity.id());

    if (pbEntity.has_sprite())
    {
        //
        // Get the associated texture loaded first
        auto texture = std::make_shared<sf::Texture>();
        m_textures.insert(texture);
        if (!texture->loadFromFile("assets/" + pbEntity.sprite().texture()))
        {
            return nullptr;
        }

        auto spriteShip = std::make_shared<sf::Sprite>();
        spriteShip->setTexture(*texture);
        // This sets the point about which rotation takes place - center of the sprite/texture
        spriteShip->setOrigin({texture->getSize().x / 2.0f, texture->getSize().y / 2.0f});

        //
        // Original inspiration: https://en.sfml-dev.org/forums/index.php?topic=15755.0
        // Define a scaling that converts from the texture size in pixels to unit coordinates
        // that match the view.  This makes the texture have the same size/shape as the view.
        sf::Vector2f scaleToUnitSize(m_viewSize.x / texture->getSize().x, m_viewSize.y / texture->getSize().y);

        // Now, set the actual size of the ship based on the size passed in through the parameter
        spriteShip->setScale(pbEntity.size().size().x() * scaleToUnitSize.x, pbEntity.size().size().x() * scaleToUnitSize.y);

        entity->addComponent(std::make_unique<components::Sprite>(spriteShip));
    }

    if (pbEntity.has_position())
    {
        entity->addComponent(std::make_unique<components::Position>(
            sf::Vector2f(pbEntity.position().center().x(), pbEntity.position().center().y()),
            pbEntity.position().orientation()));
    }

    if (pbEntity.has_size())
    {
        entity->addComponent(std::make_unique<components::Size>(m_viewSize));
    }

    if (pbEntity.has_movement())
    {
        entity->addComponent(std::make_unique<components::Movement>(pbEntity.movement().moverate(), pbEntity.movement().rotaterate()));
    }

    if (pbEntity.has_input())
    {
        std::vector<components::Input::Type> inputs;
        for (auto input : pbEntity.input().type())
        {
            switch (input)
            {
                case shared::InputType::Thrust:
                    inputs.push_back(components::Input::Type::Thrust);
                    break;
                case shared::InputType::RotateLeft:
                    inputs.push_back(components::Input::Type::RotateLeft);
                    break;
                case shared::InputType::RotateRight:
                    inputs.push_back(components::Input::Type::RotateRight);
                    break;
            }
        }

        entity->addComponent(std::make_unique<components::Input>(inputs));
    }

    return entity;
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
    m_systemNetwork->addEntity(entity);
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
// Handler for the NewEntity message.  It gets the entity built and
// added to the client model.
//
// --------------------------------------------------------------
void GameModel::handleNewEntity(std::shared_ptr<messages::NewEntity> message)
{
    auto entity = createEntity(message->getPBEntity());
    addEntity(entity);
}

// --------------------------------------------------------------
//
// Handler for the UpdateEntity message.  It checks to see if the client
// actually has the entity, and if it does, updates the components
// that are in common between the message and the entity.
//
// --------------------------------------------------------------
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
