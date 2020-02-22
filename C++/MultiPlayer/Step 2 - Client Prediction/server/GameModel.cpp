#include "GameModel.hpp"

#include "MessageQueueServer.hpp"
#include "components/Appearance.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "entities/Player.hpp"
#include "messages/ConnectAck.hpp"
#include "messages/NewEntity.hpp"
#include "messages/RemoveEntity.hpp"
#include "messages/UpdateEntity.hpp"

#include <cstdint>
#include <functional>
#include <limits>

// --------------------------------------------------------------
//
//
//
// --------------------------------------------------------------
void GameModel::update(const std::chrono::milliseconds elapsedTime)
{
    //
    // Process the network system first, it is like local input, so should
    // be processed early on.
    m_systemNetwork->update(elapsedTime, MessageQueueServer::instance().getMessages());

    //
    // Send game state updates back out to connected clients
    updateClients();
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
    m_systemNetwork->registerJoinHandler(std::bind(&GameModel::handleJoin, this, std::placeholders::_1));
    m_systemNetwork->registerInputHandler(std::bind(&GameModel::handleInput, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3));

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
}

// --------------------------------------------------------------
//
// For the entities that have updates, send those updates to all
// connected clients.
//
// --------------------------------------------------------------
void GameModel::updateClients()
{
    for (auto entityId : m_reportThese)
    {
        auto entity = m_entities[entityId];
        auto message = std::make_shared<messages::UpdateEntity>(entity);
        MessageQueueServer::instance().broadcastMessageWithLastId(message);
    }

    m_reportThese.clear();
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
            pbEntity.mutable_appearance()->set_texture(entity->getComponent<components::Appearance>()->get());
        }

        if (entity->hasComponent<components::Position>())
        {
            auto position = entity->getComponent<components::Position>();
            pbEntity.mutable_position()->mutable_center()->set_x(position->get().x);
            pbEntity.mutable_position()->mutable_center()->set_y(position->get().y);
            pbEntity.mutable_position()->set_orientation(entity->getComponent<components::Position>()->getOrientation());
        }

        if (entity->hasComponent<components::Size>())
        {
            pbEntity.mutable_size()->mutable_size()->set_x(entity->getComponent<components::Size>()->get().x);
            pbEntity.mutable_size()->mutable_size()->set_y(entity->getComponent<components::Size>()->get().y);
        }

        auto entityMessage = std::make_shared<messages::NewEntity>(pbEntity);
        MessageQueueServer::instance().sendMessage(clientId, entityMessage);
    }
}

// --------------------------------------------------------------
//
// Used to create a protobuf representation of a player entity.
// Note: This could be converted into a generate entity to protobuf
//       entity generator by checking the entity for components and
//       adding those to the protobuf entity.
//
// --------------------------------------------------------------
shared::Entity GameModel::createPlayerPBEntity(std::shared_ptr<entities::Entity>& player)
{
    shared::Entity pbEntity;

    pbEntity.set_id(player->getId());

    pbEntity.mutable_appearance()->set_texture(player->getComponent<components::Appearance>()->get());

    pbEntity.mutable_input()->add_type(shared::InputType::Thrust);
    pbEntity.mutable_input()->add_type(shared::InputType::RotateLeft);
    pbEntity.mutable_input()->add_type(shared::InputType::RotateRight);

    auto position = player->getComponent<components::Position>();
    pbEntity.mutable_position()->mutable_center()->set_x(position->get().x);
    pbEntity.mutable_position()->mutable_center()->set_y(position->get().y);
    pbEntity.mutable_position()->set_orientation(position->getOrientation());

    pbEntity.mutable_size()->mutable_size()->set_x(player->getComponent<components::Size>()->get().x);
    pbEntity.mutable_size()->mutable_size()->set_y(player->getComponent<components::Size>()->get().y);

    pbEntity.mutable_movement()->set_moverate(player->getComponent<components::Movement>()->getMoveRate());
    pbEntity.mutable_movement()->set_rotaterate(player->getComponent<components::Movement>()->getRotateRate());

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
    // Step 2: Create an entity for the newly joined player and send
    //         it to the newly joined client

    // Generate a player, add to server simulation, and send to the client
    auto player = entities::createPlayer("playerShip1_Blue.png", sf::Vector2f(0.0f, 0.0f), 0.05f, 0.0002f, 180.0f / 1000);
    addEntity(player);
    m_clientToEntityId[clientId] = player->getId();

    //
    // Build the protobuf representation and get it sent off to the client
    shared::Entity pbEntity = createPlayerPBEntity(player);

    //
    // Step 3: Send the new player entity to the newly joined client.
    MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::NewEntity>(pbEntity));

    //
    // Step 4: Let all other clients know about this new player entity

    // We change the appearance for a player ship entity for all other clients to a different
    // texture.
    player->getComponent<components::Appearance>()->set("playerShip1_Red.png");
    pbEntity.mutable_appearance()->set_texture(player->getComponent<components::Appearance>()->get());

    //
    // Remove components not needed by them to preapre it for sending to
    // all other connected clients
    pbEntity.release_input();
    pbEntity.release_movement();
    auto entityMessage = std::make_shared<messages::NewEntity>(pbEntity);
    for (auto otherId : m_clients)
    {
        if (otherId != clientId)
        {
            MessageQueueServer::instance().sendMessage(otherId, entityMessage);
        }
    }
}

// --------------------------------------------------------------
//
// Handler for the Input message.  It updates the player model based
// on the input and sends the updated state back to the player and
// any other connected clients.
//
// --------------------------------------------------------------
void GameModel::handleInput(std::shared_ptr<entities::Entity>& entity, shared::InputType type, std::chrono::milliseconds elapsedTime)
{
    auto position = entity->getComponent<components::Position>();
    auto movement = entity->getComponent<components::Movement>();
    switch (type)
    {
        case shared::InputType::Thrust:
        {
            const float PI = 3.14159f;
            const float DEGREES_TO_RADIANS = PI / 180.0f;

            auto vectorX = std::cos(position->getOrientation() * DEGREES_TO_RADIANS);
            auto vectorY = std::sin(position->getOrientation() * DEGREES_TO_RADIANS);

            auto current = position->get();
            position->set(sf::Vector2f(
                current.x + vectorX * elapsedTime.count() * movement->getMoveRate(),
                current.y + vectorY * elapsedTime.count() * movement->getMoveRate()));

            m_reportThese.insert(entity->getId());
        }
        break;
        case shared::InputType::RotateLeft:
            position->setOrientation(position->getOrientation() - movement->getRotateRate() * elapsedTime.count());
            m_reportThese.insert(entity->getId());
            break;
        case shared::InputType::RotateRight:
            position->setOrientation(position->getOrientation() + movement->getRotateRate() * elapsedTime.count());
            m_reportThese.insert(entity->getId());
            break;
    }
}
