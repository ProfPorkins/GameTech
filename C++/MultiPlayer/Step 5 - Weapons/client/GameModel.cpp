#include "GameModel.hpp"

#include "MessageQueueClient.hpp"
#include "components/AnimatedSprite.hpp"
#include "components/Input.hpp"
#include "components/Lifetime.hpp"
#include "components/Momentum.hpp"
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
bool GameModel::initialize(math::Vector2f viewSize)
{
    m_viewSize = viewSize;
    ;
    //
    // Initialize the network system, including registering handlers for
    // messages the game model has responsibility.
    m_systemNetwork = std::make_unique<systems::Network>();

    m_systemNetwork->registerNewEntityHandler(std::bind(&GameModel::handleNewEntity, this, std::placeholders::_1));
    m_systemNetwork->registerRemoveEntityHandler(std::bind(&GameModel::handleRemoveEntity, this, std::placeholders::_1));

    //
    // Initialize the keyboard input system.
    auto inputMapping = {
        std::make_tuple(components::Input::Type::RotateLeft, sf::Keyboard::A),
        std::make_tuple(components::Input::Type::RotateRight, sf::Keyboard::D),
        std::make_tuple(components::Input::Type::Thrust, sf::Keyboard::W),
        std::make_tuple(components::Input::Type::FireWeapon, sf::Keyboard::Space)};
    m_systemKeyboardInput = std::make_unique<systems::KeyboardInput>(inputMapping);

    //
    // Initialize the client interpolation system.
    m_systemMomentum = std::make_unique<systems::Momentum>();

    //
    // Initialize the lifeftime system.
    m_systemLifetime = std::make_unique<systems::Lifetime>(std::bind(&GameModel::handleRemoveEntity, this, std::placeholders::_1));

    //
    // Initialize the renderer system.
    m_systemRender = std::make_unique<systems::Renderer>();

    return true;
}

void GameModel::signalKeyPressed(sf::Event::KeyEvent event, std::chrono::microseconds elapsedTime)
{
    m_systemKeyboardInput->keyPressed(event, elapsedTime);
}

void GameModel::signalKeyReleased(sf::Event::KeyEvent event, std::chrono::microseconds elapsedTime)
{
    m_systemKeyboardInput->keyReleased(event, elapsedTime);
}

// --------------------------------------------------------------
//
// This is where everything performs its update.  The very last
// update must be the render, because all other game state updates
// must complete before rendering can start.
//
// --------------------------------------------------------------
void GameModel::update(const std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<sf::RenderTarget> renderTarget)
{
    //
    // Add any new entities we've been notified about
    for (auto&& entity : m_newEntities)
    {
        addEntity(entity);
    }
    m_newEntities.clear();

    //
    // Remove any entites we've been notified to get rid of first
    for (auto&& id : m_removeEntities)
    {
        removeEntity(id);
    }
    m_removeEntities.clear();

    //
    // Then, process the network system before anything else, it is like local input, so should
    // be processed early.
    m_systemNetwork->update(elapsedTime, now, MessageQueueClient::instance().getMessages());

    m_systemKeyboardInput->update(elapsedTime, now);
    m_systemMomentum->update(elapsedTime, now);
    m_systemLifetime->update(elapsedTime, now);

    //
    // Rendering must always be done last
    m_systemRender->update(elapsedTime, now, renderTarget);
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

    if (pbEntity.has_animatedappearance())
    {
        //
        // Get the associated texture (sprite sheet) loaded first
        auto textureSheet = std::make_shared<sf::Texture>();
        m_textures.insert(textureSheet);
        if (!textureSheet->loadFromFile("assets/" + pbEntity.animatedappearance().texture()))
        {
            return nullptr;
        }

        //
        // Extract the frame times and create SFML sprites at the same timeyy
        std::vector<std::chrono::milliseconds> spriteTime;
        std::vector<std::shared_ptr<sf::Sprite>> sprites;
        auto spriteSizeX = textureSheet->getSize().x / pbEntity.animatedappearance().spritetime().size();
        for (auto time : pbEntity.animatedappearance().spritetime())
        {
            spriteTime.push_back(std::chrono::milliseconds(time));

            auto spriteX = sprites.size() * spriteSizeX;
            auto spriteAnim = std::make_shared<sf::Sprite>(*textureSheet, sf::IntRect(static_cast<int>(spriteX), 0, spriteSizeX, textureSheet->getSize().y));
            // This sets the point about which rotation takes place - center of the sprite/texture
            spriteAnim->setOrigin({spriteSizeX / 2.0f, spriteAnim->getTexture()->getSize().y / 2.0f});

            //
            // Original inspiration: https://en.sfml-dev.org/forums/index.php?topic=15755.0
            // Define a scaling that converts from the texture size in pixels to unit coordinates
            // that match the view.  This makes the texture have the same size/shape as the view.
            sf::Vector2f scaleToUnitSize(m_viewSize.x / spriteSizeX, m_viewSize.y / spriteAnim->getTexture()->getSize().y);

            // Now, set the actual render size based on the size provided in the entity description
            spriteAnim->setScale(pbEntity.size().size().x() * scaleToUnitSize.x, pbEntity.size().size().x() * scaleToUnitSize.y);

            sprites.push_back(spriteAnim);
        }

        entity->addComponent(std::make_unique<components::AnimatedSprite>(sprites, spriteTime));
    }

    if (pbEntity.has_appearance())
    {
        //
        // Get the associated texture loaded first
        auto texture = std::make_shared<sf::Texture>();
        m_textures.insert(texture);
        if (!texture->loadFromFile("assets/" + pbEntity.appearance().texture()))
        {
            return nullptr;
        }

        auto sprite = std::make_shared<sf::Sprite>();
        sprite->setTexture(*texture);
        // This sets the point about which rotation takes place - center of the sprite/texture
        sprite->setOrigin({texture->getSize().x / 2.0f, texture->getSize().y / 2.0f});

        //
        // Original inspiration: https://en.sfml-dev.org/forums/index.php?topic=15755.0
        // Define a scaling that converts from the texture size in pixels to unit coordinates
        // that match the view.  This makes the texture have the same size/shape as the view.
        sf::Vector2f scaleToUnitSize(m_viewSize.x / texture->getSize().x, m_viewSize.y / texture->getSize().y);

        // Now, set the actual render size based on the size provided in the entity description
        sprite->setScale(pbEntity.size().size().x() * scaleToUnitSize.x, pbEntity.size().size().x() * scaleToUnitSize.y);

        entity->addComponent(std::make_unique<components::Sprite>(sprite));
    }

    if (pbEntity.has_position())
    {
        entity->addComponent(std::make_unique<components::Position>(
            math::Vector2f(pbEntity.position().center().x(), pbEntity.position().center().y()),
            pbEntity.position().orientation()));
    }

    if (pbEntity.has_size())
    {
        entity->addComponent(std::make_unique<components::Size>(m_viewSize));
    }

    if (pbEntity.has_movement())
    {
        entity->addComponent(std::make_unique<components::Movement>(
            pbEntity.movement().thrustrate(),
            pbEntity.movement().rotaterate()));
    }

    if (pbEntity.has_momentum())
    {
        entity->addComponent(std::make_unique<components::Momentum>(
            math::Vector2f(pbEntity.momentum().momentum().x(), pbEntity.momentum().momentum().y())));
    }

    //
    // This is on the client side and no rate limiting of input is being done here, for now.
    // Therefore, the time on each input is set to 0.  However, if network traffic is desired to
    // be reduced, transmitting that information and putting the rate limit here can help.  But
    // remember, the server must still verify how often an input may be accepted, don't trust the
    // client.
    if (pbEntity.has_input())
    {
        std::vector<std::pair<components::Input::Type, std::chrono::microseconds>> inputs;
        for (auto input : pbEntity.input().type())
        {
            switch (input)
            {
                case shared::InputType::Thrust:
                    inputs.push_back(std::pair(components::Input::Type::Thrust, std::chrono::microseconds(0)));
                    break;
                case shared::InputType::RotateLeft:
                    inputs.push_back(std::pair(components::Input::Type::RotateLeft, std::chrono::microseconds(0)));
                    break;
                case shared::InputType::RotateRight:
                    inputs.push_back(std::pair(components::Input::Type::RotateRight, std::chrono::microseconds(0)));
                    break;
                case shared::InputType::FireWeapon:
                    inputs.push_back(std::pair(components::Input::Type::FireWeapon, std::chrono::microseconds(0)));
                    break;
            }
        }

        entity->addComponent(std::make_unique<components::Input>(inputs));
    }

    if (pbEntity.has_lifetime())
    {
        auto howLong = std::chrono::microseconds(pbEntity.lifetime().howlong());
        entity->addComponent(std::make_unique<components::Lifetime>(howLong));
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
    m_systemMomentum->addEntity(entity);
    m_systemLifetime->addEntity(entity);
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
    m_systemNetwork->removeEntity(entityId);
    m_systemMomentum->removeEntity(entityId);
    m_systemRender->removeEntity(entityId);
    m_systemLifetime->removeEntity(entityId);
}

// --------------------------------------------------------------
//
// Used to build up the list of entities to add in the next update.
//
// --------------------------------------------------------------
void GameModel::handleNewEntity(const shared::Entity& pbEntity)
{
    m_newEntities.push_back(createEntity(pbEntity));
}

// --------------------------------------------------------------
//
// Handler for the RemoveEntity message.  It removes the entity from
// the client game model (that's us!).
//
// --------------------------------------------------------------
void GameModel::handleRemoveEntity(entities::Entity::IdType entityId)
{
    m_removeEntities.insert(entityId);
}
