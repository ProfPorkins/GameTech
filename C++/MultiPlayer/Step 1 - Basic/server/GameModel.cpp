#include "GameModel.hpp"

#include "entities/Player.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Movement.hpp"
#include "Player.pb.h"

#include <sstream>

// --------------------------------------------------------------
//
//
//
// --------------------------------------------------------------
void GameModel::update(const std::chrono::milliseconds elapsedTime)
{
}

// --------------------------------------------------------------
//
// Upon connection of a new client, create a player entity and
// send that info back to the client, along with adding it to
// the server simulation.
//
// --------------------------------------------------------------
void GameModel::clientConnected(std::unique_ptr<sf::TcpSocket> socket)
{
    std::lock_guard<std::mutex> lock(m_mutexSockets);
    // Ensure this is a new connection before moving forward
    if (m_sockets.find(socket->getRemoteAddress().toInteger()) == m_sockets.end())
    {
        // Remember the socket/client
        auto pSocket = socket.get();    // NOTE: Part of the quick hack below
        m_sockets[socket->getRemoteAddress().toInteger()] = std::move(socket);
        //
        // Generate a player, add to server simulation, and send to the client
        auto player = entities::createPlayer(sf::Vector2f(0.0f, 0.0f), 0.05f, 0.0002f, 180.0f / 1000);
        addEntity(player);

        //
        // NOTE: Quick hack for now, just to get something to send
        //
        // Build the PB message
        shared::Player pbPlayer;
        
        auto position = player->getComponent<components::Position>();
        pbPlayer.mutable_position()->mutable_center()->set_x(position->get().x);
        pbPlayer.mutable_position()->mutable_center()->set_x(position->get().y);
        pbPlayer.mutable_position()->set_orientation(player->getComponent<components::Position>()->getOrientation());

        pbPlayer.mutable_size()->mutable_size()->set_x(player->getComponent<components::Size>()->get().x);
        pbPlayer.mutable_size()->mutable_size()->set_y(player->getComponent<components::Size>()->get().y);

        pbPlayer.mutable_movement()->set_moverate(player->getComponent<components::Movement>()->getMoveRate());
        pbPlayer.mutable_movement()->set_rotaterate(player->getComponent<components::Movement>()->getRotateRate());


        std::string sendPlayer;
        if (pbPlayer.SerializeToString(&sendPlayer))
        {
            pSocket->send(static_cast<void*>(sendPlayer.data()), sendPlayer.size());
        }
    }
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
