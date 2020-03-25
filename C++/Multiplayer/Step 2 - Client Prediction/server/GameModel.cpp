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
#include "messages/Utility.hpp"

#include <cstdint>
#include <functional>
#include <limits>

// --------------------------------------------------------------
//
// This is where the server-side simulation takes place.  Messages
// from the network are processed and then any necessary client
// updates are sent out.
//
// --------------------------------------------------------------
void GameModel::update(const std::chrono::milliseconds elapsedTime)
{
    //
    // Process the network system first, it is like local input, so should
    // be processed early on.
    m_systemNetwork->update(elapsedTime, MessageQueueServer::instance().getMessages());
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
// For the indicated client, sends messages for all other entities
// currently in the game simulation.
//
// --------------------------------------------------------------
void GameModel::reportAllEntities(std::uint64_t clientId)
{
    for (auto& [entityId, entity] : m_entities)
    {
        auto pbEntity = messages::createReportablePBEntity(entity);
        auto entityMessage = std::make_shared<messages::NewEntity>(pbEntity);
        MessageQueueServer::instance().sendMessage(clientId, entityMessage);
    }
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
    auto player = entities::player::create("playerShip1_Blue.png", sf::Vector2f(0.0f, 0.0f), 0.05f, 0.0002f, 180.0f / 1000);
    addEntity(player);
    m_clientToEntityId[clientId] = player->getId();

    //
    // Build the protobuf representation and get it sent off to the client
    auto pbEntity = messages::createPBEntity(player);

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
