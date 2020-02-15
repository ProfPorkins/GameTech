#include "GameModel.hpp"

#include "MessageQueueServer.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "messages/ConnectAck.hpp"

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
}

// --------------------------------------------------------------
//
// Setup notifications for when new clients connect.
//
// --------------------------------------------------------------
bool GameModel::initialize()
{
    //
    // Initialize the various systems
    m_systemNetwork = std::make_unique<systems::Network>(std::bind(&GameModel::addEntity, this, std::placeholders::_1));

    MessageQueueServer::instance().onClientConnected(std::bind(&GameModel::clientConnected, this, std::placeholders::_1));
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
void GameModel::clientConnected(sf::Uint32 clientId)
{
    m_players.insert(clientId);

    MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::ConnectAck>(clientId));
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
}

// --------------------------------------------------------------
//
// All entity lists for the systems must be given a chance to remove
// the entity.
//
// --------------------------------------------------------------
void GameModel::removeEntity(decltype(entities::Entity().getId()) entityId)
{
    m_entities.erase(entityId);
    //
    // Let each of the systems know to remove the entity
}
