#include "GameModel.hpp"

#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "entities/Player.hpp"
#include "messages/ConnectSelf.hpp"

// --------------------------------------------------------------
//
//
//
// --------------------------------------------------------------
void GameModel::update(const std::chrono::milliseconds elapsedTime)
{
    (void)elapsedTime;
}

// --------------------------------------------------------------
//
// Create the message queue and setup notifications for when new
// clients connect.
//
// --------------------------------------------------------------
bool GameModel::initializeMessageQueue()
{
    m_mq = std::make_unique<MessageQueueServer>();
    return m_mq->initialize(3000, std::bind(&GameModel::clientConnected, this, std::placeholders::_1));
}

// --------------------------------------------------------------
//
// Give everything a chance to gracefully shutdown.
//
// --------------------------------------------------------------
void GameModel::shutdown()
{
    m_mq->shutdown();
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

    // Generate a player, add to server simulation, and send to the client
    auto player = entities::createPlayer(sf::Vector2f(0.0f, 0.0f), 0.05f, 0.0002f, 180.0f / 1000);
    addEntity(player);

    m_mq->sendMessage(clientId, std::make_shared<messages::ConnectSelf>(player));
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
