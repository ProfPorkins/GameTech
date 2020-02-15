#include "GameModel.hpp"

#include "MessageQueueServer.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "entities/Player.hpp"
#include "messages/ConnectAck.hpp"
#include "messages/NotifyJoinSelf.hpp"

#include <functional>
#include <cstdint>

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
    m_systemNetwork = std::make_unique<systems::Network>();
    m_systemNetwork->registerHandler(messages::Type::Join,
                                     [this](std::uint32_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                         (void)elapsedTime; // unused parameter
                                         handleJoin(clientId, std::static_pointer_cast<messages::Join>(message));
                                     });

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
void GameModel::clientConnected(std::uint32_t clientId)
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

// --------------------------------------------------------------
//
// Handler for the Join message.  It gets a player entity created,
// added to the server game model, and notifies the requesting client
// of the player.
//
// --------------------------------------------------------------
void GameModel::handleJoin(std::uint32_t clientId, std::shared_ptr<messages::Join> message)
{
    // Generate a player, add to server simulation, and send to the client
    auto player = entities::createPlayer(sf::Vector2f(0.0f, 0.0f), 0.05f, 0.0002f, 180.0f / 1000);
    addEntity(player);

    MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::NotifyJoinSelf>(player));
}
