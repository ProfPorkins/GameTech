#include "GameModel.hpp"

#include "MessageQueueServer.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "entities/Player.hpp"
#include "messages/ConnectAck.hpp"
#include "messages/NotifyJoinSelf.hpp"
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
    m_systemNetwork->registerHandler(messages::Type::Join,
                                     [this](std::uint32_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                         (void)elapsedTime; // unused parameter
                                         handleJoin(clientId, std::static_pointer_cast<messages::Join>(message));
                                     });

    m_systemNetwork->registerHandler(messages::Type::Input,
                                     [this](std::uint32_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                         (void)elapsedTime; // unused parameter
                                         handleInput(clientId, std::static_pointer_cast<messages::Input>(message));
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
    // TODO: remove the entity from the clientIdToEntityId map

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
    // Need to provide the mapping from the clientId to the player's entityId
    m_clientIdToEntityId[clientId] = player->getId();
    // Go ahead and add to the game model
    addEntity(player);

    MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::NotifyJoinSelf>(player));
}

// --------------------------------------------------------------
//
// Handler for the Input message.  It updates the player model based
// on the input and sends the updated state back to the player and
// any other connected clients.
//
// --------------------------------------------------------------
void GameModel::handleInput(std::uint32_t clientId, std::shared_ptr<messages::Input> message)
{
    //std::cout << "received an input messages: " << message->getPBInput().type() << std::endl;
    auto entityId = m_clientIdToEntityId[clientId];
    auto player = m_entities[entityId];
    auto position = player->getComponent<components::Position>();
    auto movement = player->getComponent<components::Movement>();

    switch (message->getPBInput().type())
    {
        case shared::InputType::Thrust:
        {
            const float PI = 3.14159f;
            const float DEGREES_TO_RADIANS = PI / 180.0f;

            auto vectorX = std::cos(position->getOrientation() * DEGREES_TO_RADIANS);
            auto vectorY = std::sin(position->getOrientation() * DEGREES_TO_RADIANS);

            auto current = position->get();
            position->set(sf::Vector2f(
                current.x + vectorX * message->getPBInput().elapsedtime() * movement->getMoveRate(),
                current.y + vectorY * message->getPBInput().elapsedtime() * movement->getMoveRate()));

            m_reportThese.insert(entityId);
        }
        break;
        case shared::InputType::RotateLeft:
            position->setOrientation(position->getOrientation() - movement->getRotateRate() * message->getPBInput().elapsedtime());
            m_reportThese.insert(entityId);
            break;
        case shared::InputType::RotateRight:
            position->setOrientation(position->getOrientation() + movement->getRotateRate() * message->getPBInput().elapsedtime());
            m_reportThese.insert(entityId);
            break;
    }
}

void GameModel::updateClients()
{
    for (auto entityId : m_reportThese)
    {
        auto entity = m_entities[entityId];
        auto message = std::make_shared<messages::UpdateEntity>(entity);
        MessageQueueServer::instance().broadcastMessage(message);
    }

    m_reportThese.clear();
}
