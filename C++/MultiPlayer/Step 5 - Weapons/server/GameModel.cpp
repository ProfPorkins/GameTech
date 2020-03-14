#include "GameModel.hpp"

#include "MessageQueueServer.hpp"
#include "components/AnimatedAppearance.hpp"
#include "components/Appearance.hpp"
#include "components/Momentum.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Lifetime.hpp"
#include "entities/Explosion.hpp"
#include "entities/Player.hpp"
#include "messages/ConnectAck.hpp"
#include "messages/NewEntity.hpp"
#include "messages/RemoveEntity.hpp"

#include <cstdint>
#include <functional>
#include <limits>
#include <vector>

// --------------------------------------------------------------
//
// This is where the server-side simulation takes place.  Messages
// from the network are processed and then any necessary client
// updates are sent out.
//
// --------------------------------------------------------------
void GameModel::update(const std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now)
{
    //
    // Process the network system first, it is like local input, so should
    // be processed early on.
    // Note: It now has to be processed before movement in order to correctly
    //       match the order of KeyboardInput before movement on the client.
    m_systemNetwork->update(elapsedTime, now, MessageQueueServer::instance().getMessages());

    m_systemMomentum->update(elapsedTime, now);
}

// --------------------------------------------------------------
//
// Setup notifications for when new clients connect.
//
// --------------------------------------------------------------
bool GameModel::initialize()
{
    //
    // TODO: Super dangerous, I know.  I'll eventually find a better solution that
    // doesn't require creating guids;
    entities::Entity::nextId = std::numeric_limits<entities::Entity::IdType>::max() / 2;

    //
    // Initialize the various systems
    m_systemNetwork = std::make_unique<systems::Network>();
    m_systemNetwork->registerNewEntityHandler(std::bind(&GameModel::handleNewEntity, this, std::placeholders::_1));
    m_systemNetwork->registerJoinHandler(std::bind(&GameModel::handleJoin, this, std::placeholders::_1));

    m_systemMomentum = std::make_unique<systems::Momentum>();

    MessageQueueServer::instance().registerConnectHandler(std::bind(&GameModel::handleConnect, this, std::placeholders::_1));
    MessageQueueServer::instance().registerDisconnectHandler(std::bind(&GameModel::handleDisconnect, this, std::placeholders::_1));

    return true;
}

// --------------------------------------------------------------
//
// Give everything a chance to gracefully shutdown.
//
// --------------------------------------------------------------
void GameModel::shutdown()
{
}

// --------------------------------------------------------------
//
// Upon connection of a new client, create a player entity and
// send that info back to the client, along with adding it to
// the server simulation.
//
// --------------------------------------------------------------
void GameModel::handleConnect(std::uint64_t clientId)
{
    m_clients.insert(clientId);

    MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::ConnectAck>());
}

// --------------------------------------------------------------
//
// When a client disconnects, need to tell all the other clients
// of the disconnect.
//
// --------------------------------------------------------------
void GameModel::handleDisconnect(std::uint64_t clientId)
{
    m_clients.erase(clientId);

    auto message = std::make_shared<messages::RemoveEntity>(m_clientToEntityId[clientId]);
    MessageQueueServer::instance().broadcastMessage(message);
    //
    // Remove the player entity from the server simulation
    removeEntity(m_clientToEntityId[clientId]);

    m_clientToEntityId.erase(clientId);
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

    m_systemNetwork->addEntity(entity);
    m_systemMomentum->addEntity(entity);
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
    m_systemNetwork->removeEntity(entityId);
    m_systemMomentum->removeEntity(entityId);
}

// --------------------------------------------------------------
//
// For the indicated client, sends messages for all other entities
// currently in the game simulation.
//
// --------------------------------------------------------------
void GameModel::reportAllEntities(std::uint64_t clientId)
{
    for (auto& [entityId, entity] : m_entities)
    {
        shared::Entity pbEntity;

        pbEntity.set_id(entity->getId());

        if (entity->hasComponent<components::Appearance>())
        {
            pbEntity.mutable_appearance()->set_texture(entity->getComponent<components::Appearance>()->getTexture());
        }

        if (entity->hasComponent<components::Position>())
        {
            auto position = entity->getComponent<components::Position>();
            pbEntity.mutable_position()->mutable_center()->set_x(position->get().x);
            pbEntity.mutable_position()->mutable_center()->set_y(position->get().y);
            pbEntity.mutable_position()->set_orientation(entity->getComponent<components::Position>()->getOrientation());
        }

        if (entity->hasComponent<components::Movement>())
        {
            auto movement = entity->getComponent<components::Movement>();
            pbEntity.mutable_movement()->set_thrustrate(movement->getThrustRate());
            pbEntity.mutable_movement()->set_rotaterate(movement->getRotateRate());
        }

        if (entity->hasComponent<components::Momentum>())
        {
            auto momentum = entity->getComponent<components::Momentum>();
            pbEntity.mutable_momentum()->mutable_momentum()->set_x(momentum->get().x);
            pbEntity.mutable_momentum()->mutable_momentum()->set_y(momentum->get().y);
        }

        if (entity->hasComponent<components::Size>())
        {
            pbEntity.mutable_size()->mutable_size()->set_x(entity->getComponent<components::Size>()->get().x);
            pbEntity.mutable_size()->mutable_size()->set_y(entity->getComponent<components::Size>()->get().y);
        }
        pbEntity.set_updatewindow(0);

        auto entityMessage = std::make_shared<messages::NewEntity>(pbEntity);
        MessageQueueServer::instance().sendMessage(clientId, entityMessage);
    }
}

// --------------------------------------------------------------
//
// Used to create a protobuf representation of an entity.
//
// --------------------------------------------------------------
shared::Entity GameModel::createPBEntity(std::shared_ptr<entities::Entity>& entity)
{
    shared::Entity pbEntity;

    pbEntity.set_id(entity->getId());

    if (entity->hasComponent<components::AnimatedAppearance>())
    {
        pbEntity.mutable_animatedappearance()->set_texture(entity->getComponent<components::AnimatedAppearance>()->getTexture());
        for (auto&& time : entity->getComponent<components::AnimatedAppearance>()->getSpriteTime())
        {
            pbEntity.mutable_animatedappearance()->add_spritetime(static_cast<std::uint32_t>(time.count()));
        }
    }

    if (entity->hasComponent<components::Appearance>())
    {
        pbEntity.mutable_appearance()->set_texture(entity->getComponent<components::Appearance>()->getTexture());
    }

    if (entity->hasComponent<components::Input>())
    {
        for (auto input : entity->getComponent<components::Input>()->getInputs())
        {
            switch (input)
            {
                case components::Input::Type::Thrust:
                    pbEntity.mutable_input()->add_type(shared::InputType::Thrust);
                    break;
                case components::Input::Type::RotateLeft:
                    pbEntity.mutable_input()->add_type(shared::InputType::RotateLeft);
                    break;
                case components::Input::Type::RotateRight:
                    pbEntity.mutable_input()->add_type(shared::InputType::RotateRight);
                    break;
                case components::Input::Type::FireWeapon:
                    pbEntity.mutable_input()->add_type(shared::InputType::FireWeapon);
                    break;
            }
        }
    }

    if (entity->hasComponent<components::Position>())
    {
        auto position = entity->getComponent<components::Position>();
        pbEntity.mutable_position()->mutable_center()->set_x(position->get().x);
        pbEntity.mutable_position()->mutable_center()->set_y(position->get().y);
        pbEntity.mutable_position()->set_orientation(position->getOrientation());
    }

    if (entity->hasComponent<components::Size>())
    {
        pbEntity.mutable_size()->mutable_size()->set_x(entity->getComponent<components::Size>()->get().x);
        pbEntity.mutable_size()->mutable_size()->set_y(entity->getComponent<components::Size>()->get().y);
    }

    if (entity->hasComponent<components::Movement>())
    {
        pbEntity.mutable_movement()->set_thrustrate(entity->getComponent<components::Movement>()->getThrustRate());
        pbEntity.mutable_movement()->set_rotaterate(entity->getComponent<components::Movement>()->getRotateRate());
    }

    if (entity->hasComponent<components::Momentum>())
    {
        pbEntity.mutable_momentum()->mutable_momentum()->set_x(entity->getComponent<components::Momentum>()->get().x);
        pbEntity.mutable_momentum()->mutable_momentum()->set_y(entity->getComponent<components::Momentum>()->get().y);
    }

    if (entity->hasComponent<components::Lifetime>())
    {
        auto lifetime = entity->getComponent<components::Lifetime>();
        pbEntity.mutable_lifetime()->set_howlong(static_cast<std::uint32_t>(lifetime->get().count()));
    }

    return pbEntity;
}

// --------------------------------------------------------------
//
// Handler for the Join message.  It gets a player entity created,
// added to the server game model, and notifies the requesting client
// of the player.
//
// --------------------------------------------------------------
void GameModel::handleJoin(std::uint64_t clientId)
{
    //
    // Step 1: Tell the newly connected player about all other entities
    reportAllEntities(clientId);

    //
    // This was just temporary while I worked on the animated sprite component
    // for explosions.
    //auto fiftyMS = std::chrono::milliseconds(50);
    //auto frameTimes = {fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS};
    //auto explosion = entities::explosion::create("explosion.png", {0.0f, 0.25f}, 0.07f, frameTimes);
    //addEntity(explosion);
    //shared::Entity pbExplosion = createPBEntity(explosion);
    //MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::NewEntity>(pbExplosion));

    //
    // Step 2: Create an entity for the newly joined player and send
    //         it to the newly joined client

    // Generate a player, add to server simulation, and send to the client
    auto player = entities::player::create("playerShip1_Blue.png", {0.0f, 0.0f}, 0.05f, 0.0000000002f, 180.0f / 1000, {0, 0});
    addEntity(player);
    m_clientToEntityId[clientId] = player->getId();

    //
    // Build the protobuf representation and get it sent off to the client
    shared::Entity pbEntity = createPBEntity(player);

    //
    // Step 3: Send the new player entity to the newly joined client.
    MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::NewEntity>(pbEntity));

    //
    // Step 4: Let all other clients know about this new player entity

    // We change the appearance for a player ship entity for all other clients to a different
    // texture.
    player->removeComponent<components::Appearance>();
    player->addComponent(std::make_unique<components::Appearance>("playerShip1_Red.png"));
    pbEntity.mutable_appearance()->set_texture(player->getComponent<components::Appearance>()->getTexture());

    //
    // Remove components not needed on the client by them to preapre it for sending to
    // all other connected clients
    pbEntity.release_input();
    auto entityMessage = std::make_shared<messages::NewEntity>(pbEntity);
    for (auto otherId : m_clients)
    {
        if (otherId != clientId)
        {
            MessageQueueServer::instance().sendMessage(otherId, entityMessage);
        }
    }
}

void GameModel::handleNewEntity(std::shared_ptr<entities::Entity> entity)
{
    addEntity(entity);
    //
    // Build the protobuf representation and get it sent off to the client
    shared::Entity pbEntity = createPBEntity(entity);
    MessageQueueServer::instance().broadcastMessage(std::make_shared<messages::NewEntity>(pbEntity));
}
