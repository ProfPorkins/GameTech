#include "Network.hpp"

#include "MessageQueueClient.hpp"
#include "components/Goal.hpp"
#include "components/Input.hpp"
#include "components/Momentum.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "entities/Player.hpp"
#include "messages/Input.hpp"
#include "messages/Join.hpp"
#include "messages/MessageTypes.hpp"
#include "messages/NewEntity.hpp"
#include "messages/RemoveEntity.hpp"
#include "misc/math.hpp"

#include <chrono>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Primary activity in the constructor is to setup the command map
    // that maps from message types to their handlers.
    //
    // --------------------------------------------------------------
    Network::Network() :
        System({ctti::unnamed_type_id<components::Position>()})
    {
        //
        // We know how to privately handle these messages
        registerHandler(messages::Type::ConnectAck,
                        [this](std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<messages::Message> message) {
                            (void)elapsedTime;
                            (void)now;
                            // Not completely in love with having to do a static_pointer_cast, but living with it for now
                            handleConnectAck(std::static_pointer_cast<messages::ConnectAck>(message));
                        });

        registerHandler(messages::Type::NewEntity,
                        [this](std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<messages::Message> message) {
                            (void)elapsedTime; // unused parameter
                            (void)now;
                            m_newEntityHandler(std::static_pointer_cast<messages::NewEntity>(message)->getPBEntity());
                        });

        registerHandler(messages::Type::UpdateEntity,
                        [this](std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<messages::Message> message) {
                            (void)elapsedTime; // unused parameter
                            handleUpdateEntity(std::static_pointer_cast<messages::UpdateEntity>(message), now);
                        });

        registerHandler(messages::Type::RemoveEntity,
                        [this](std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<messages::Message> message) {
                            (void)elapsedTime; // unused parameter
                            (void)now;
                            auto entityId = std::static_pointer_cast<messages::RemoveEntity>(message)->getPBEntity().id();
                            m_removeEntityHandler(entityId);
                        });
    }

    // --------------------------------------------------------------
    //
    // Allow handlers for messages to be registered.
    //
    // --------------------------------------------------------------
    void Network::registerHandler(messages::Type type, std::function<void(std::chrono::microseconds, const std::chrono::system_clock::time_point, std::shared_ptr<messages::Message>)> handler)
    {
        m_commandMap[type] = handler;
    }

    // --------------------------------------------------------------
    //
    // Process all outstanding messages since the last update.
    //
    // --------------------------------------------------------------
    void Network::update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::queue<std::shared_ptr<messages::Message>> messages)
    {
        (void)now;
        m_updatedEntities.clear();
        while (!messages.empty())
        {
            auto message = messages.front();
            messages.pop();
            auto entry = m_commandMap.find(message->getType());
            if (entry != m_commandMap.end())
            {
                auto& [type, handler] = *entry;
                handler(elapsedTime, now, message);
            }
            if (message->getMessageId().has_value())
            {
                m_lastMessageId = message->getMessageId().value();
            }
        }

        //
        // After processing all the messages, perform server reconciliation by
        // resimulating the inputs from any sent messages not yet acknowledged by the server.
        auto sent = MessageQueueClient::instance().getSendMessageHistory(m_lastMessageId);
        while (!sent.empty())
        {
            auto message = sent.front();
            sent.pop();
            if (message->getType() == messages::Type::Input)
            {
                auto* inputMessage = static_cast<messages::Input*>(message.get());
                auto entity = m_entities[inputMessage->getEntityId()].get();

                if (m_updatedEntities.find(entity->getId()) != m_updatedEntities.end())
                {
                    for (auto&& input : inputMessage->getInputs())
                    {
                        switch (input)
                        {
                            case components::Input::Type::Thrust:
                                entities::thrust(entity, inputMessage->getElapsedTime());
                                break;
                            case components::Input::Type::RotateLeft:
                                entities::rotateLeft(entity, inputMessage->getElapsedTime());
                                break;
                            case components::Input::Type::RotateRight:
                                entities::rotateRight(entity, inputMessage->getElapsedTime());
                                break;
                            case components::Input::Type::FireWeapon:
                                // Not resimulated, we just wait for the server to handle it and respond
                                break;
                        }
                    }
                }
            }
        }
    }

    // --------------------------------------------------------------
    //
    // Handler for the ConnectAck message.  This records the clientId
    // assigned to it by the server, it also sends a request to the server
    // to join the game.
    //
    // --------------------------------------------------------------
    void Network::handleConnectAck(std::shared_ptr<messages::ConnectAck> message)
    {
        //
        // Now, send a Join message back to the server so we can get into the game!
        MessageQueueClient::instance().sendMessage(std::make_shared<messages::Join>());
    }

    // --------------------------------------------------------------
    //
    // Handler for the UpdateEntity message.  It checks to see if the client
    // actually has the entity, and if it does, updates the components
    // that are in common between the message and the entity.
    //
    // --------------------------------------------------------------
    void Network::handleUpdateEntity(std::shared_ptr<messages::UpdateEntity> message, const std::chrono::system_clock::time_point now)
    {
        auto& pbEntity = message->getPBEntity();
        if (m_entities.find(pbEntity.id()) != m_entities.end())
        {
            auto entity = m_entities[pbEntity.id()];
            if (entity->hasComponent<components::Goal>() && pbEntity.has_position())
            {
                // If it has a Goal, it has a Position
                auto position = entity->getComponent<components::Position>();
                auto goal = entity->getComponent<components::Goal>();

                goal->setUpdateWindow(std::chrono::microseconds(pbEntity.updatewindow()));
                goal->setUpdatedTime(std::chrono::microseconds(0));
                goal->setGoalPosition(math::Vector2f(pbEntity.position().center().x(), pbEntity.position().center().y()));
                goal->setGoalOrientation(pbEntity.position().orientation());

                goal->setStartPosition(position->get());
                goal->setStartOrientation(position->getOrientation());
            }
            else if (entity->hasComponent<components::Position>() && pbEntity.has_position())
            {
                auto position = entity->getComponent<components::Position>();

                position->set(math::Vector2f(pbEntity.position().center().x(), pbEntity.position().center().y()));
                position->setOrientation(pbEntity.position().orientation());
                position->setLastServerUpdate(now);
            }

            //
            // If it has Momentum, it has Position, and that was updated above
            if (entity->hasComponent<components::Momentum>())
            {
                auto momentum = entity->getComponent<components::Momentum>();
                momentum->set(math::Vector2f(pbEntity.momentum().momentum().x(), pbEntity.momentum().momentum().y()));
                m_updatedEntities.insert(entity->getId());
            }
        }
    }
} // namespace systems
