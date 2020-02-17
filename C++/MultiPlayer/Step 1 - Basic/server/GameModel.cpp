#include "GameModel.hpp"

#include "MessageQueueServer.hpp"
#include "components/Appearance.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "entities/Player.hpp"
#include "messages/ConnectAck.hpp"
#include "messages/NewEntity.hpp"
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
                                     [this](std::uint64_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                         (void)elapsedTime; // unused parameter
                                         handleJoin(clientId, std::static_pointer_cast<messages::Join>(message));
                                     });

    m_systemNetwork->registerHandler(messages::Type::Input,
                                     [this](std::uint64_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                                         (void)clientId;
                                         (void)elapsedTime; // unused parameter
                                         handleInput(std::static_pointer_cast<messages::Input>(message));
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
void GameModel::clientConnected(std::uint64_t clientId)
{
    m_players.insert(clientId);

    MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::ConnectAck>());
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
void GameModel::handleJoin(std::uint64_t clientId, std::shared_ptr<messages::Join> message)
{
    //
    // Step 1: Tell the newly connected player about all other entities
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

    //
    // Step 2: Create an entity for the newly connected player

    // Generate a player, add to server simulation, and send to the client
    auto player = entities::createPlayer("playerShip1_Blue.png", sf::Vector2f(0.0f, 0.0f), 0.05f, 0.0002f, 180.0f / 1000);
    addEntity(player);

    //
    // Build the protobuf represetnation and get it sent off to the client
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

        //
        // Step 3: Send the new player entity to the newly joined client.
        MessageQueueServer::instance().sendMessage(clientId, std::make_shared<messages::NewEntity>(pbEntity));

        //
        // Step 4: Let all other clients know about this new player entity

        // We change the appearance for a player ship entity for all other clients to a different
        // texture.
        player->getComponent<components::Appearance>()->set("playerShip1_Red.png");
        pbEntity.mutable_appearance()->set_texture(player->getComponent<components::Appearance>()->get());

        pbEntity.release_input();
        pbEntity.release_movement();
        auto entityMessage = std::make_shared<messages::NewEntity>(pbEntity);
        for (auto otherId : m_players)
        {
            if (otherId != clientId)
            {
                MessageQueueServer::instance().sendMessage(otherId, entityMessage);
            }
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
void GameModel::handleInput(std::shared_ptr<messages::Input> message)
{
    auto entityId = message->getPBInput().entityid();
    auto entity = m_entities[entityId];
    auto position = entity->getComponent<components::Position>();
    auto movement = entity->getComponent<components::Movement>();

    for (auto input : message->getPBInput().input())
    {
        switch (input.type())
        {
            case shared::InputType::Thrust:
            {
                const float PI = 3.14159f;
                const float DEGREES_TO_RADIANS = PI / 180.0f;

                auto vectorX = std::cos(position->getOrientation() * DEGREES_TO_RADIANS);
                auto vectorY = std::sin(position->getOrientation() * DEGREES_TO_RADIANS);

                auto current = position->get();
                position->set(sf::Vector2f(
                    current.x + vectorX * input.elapsedtime() * movement->getMoveRate(),
                    current.y + vectorY * input.elapsedtime() * movement->getMoveRate()));

                m_reportThese.insert(entityId);
            }
            break;
            case shared::InputType::RotateLeft:
                position->setOrientation(position->getOrientation() - movement->getRotateRate() * input.elapsedtime());
                m_reportThese.insert(entityId);
                break;
            case shared::InputType::RotateRight:
                position->setOrientation(position->getOrientation() + movement->getRotateRate() * input.elapsedtime());
                m_reportThese.insert(entityId);
                break;
        }
    }
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
        MessageQueueServer::instance().broadcastMessage(message);
    }

    m_reportThese.clear();
}
