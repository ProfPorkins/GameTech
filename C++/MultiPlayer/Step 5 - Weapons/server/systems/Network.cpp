#include "Network.hpp"

#include "MessageQueueServer.hpp"
#include "entities/Player.hpp"
#include "messages/UpdateEntity.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Primary activity in the constructor is to setup the command map
    // that maps from message types to their handlers.
    //
    // --------------------------------------------------------------
    Network::Network() :
        System({ctti::unnamed_type_id<components::Position>(),
                ctti::unnamed_type_id<components::Movement>()})
    {
        //
        // Register our own join handler
        registerHandler(messages::Type::Join,
                        [this](std::uint64_t clientId, std::chrono::microseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                            (void)elapsedTime; // unused parameter
                            (void)message;     // unused parameter
                            if (m_joinHandler)
                            {
                                m_joinHandler(clientId);
                            }
                        });

        //
        // Register our own input handler
        registerHandler(messages::Type::Input,
                        [this](std::uint64_t clientId, std::chrono::microseconds elapsedTime, std::shared_ptr<messages::Message> message) {
                            (void)clientId;    // unused parameter
                            (void)elapsedTime; // unused parameter
                            handleInput(std::static_pointer_cast<messages::Input>(message));
                        });
    }

    // --------------------------------------------------------------
    //
    // Process all outstanding messages since the last update.
    //
    // --------------------------------------------------------------
    void Network::update(std::chrono::microseconds elapsedTime, std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> messages)
    {
        while (!messages.empty())
        {
            auto [clientId, message] = messages.front();
            messages.pop();
            auto entry = m_commandMap.find(message->getType());
            if (entry != m_commandMap.end())
            {
                auto& [type, handler] = *entry;
                handler(clientId, elapsedTime, message);
            }
        }

        //
        // Send updated game state updates back out to connected clients
        updateClients(elapsedTime);
    }

    // --------------------------------------------------------------
    //
    // Allow message handlers to be registered.
    //
    // --------------------------------------------------------------
    void Network::registerHandler(messages::Type type, std::function<void(std::uint64_t, std::chrono::microseconds, std::shared_ptr<messages::Message>)> handler)
    {
        m_commandMap[type] = handler;
    }

    // --------------------------------------------------------------
    //
    // Handler for the Input message.  Finds out the input type and then
    // hands off the processing of the input to the appropriate entity function.
    //
    // --------------------------------------------------------------
    void Network::handleInput(std::shared_ptr<messages::Input> message)
    {
        auto entityId = message->getPBInput().entityid();
        auto entity = m_entities[entityId].get();

        for (auto&& input : message->getPBInput().input())
        {
            switch (input.type())
            {
                case shared::InputType::Thrust:
                {
                    //
                    // The client applies thrust and then drifts in a single update.  Therefore,
                    // at the server, when a thrust input is seen, the entity must also drift
                    // for that amount of time at that thrust level in order to match with the
                    // client.  This amount of time must also be later subtracted during the movement
                    // system because that drift time was simulated here.
                    entities::thrust(entity, std::chrono::microseconds(input.elapsedtime()));
                    entities::drift(entity, std::chrono::microseconds(input.elapsedtime()));
                    auto movement = entity->getComponent<components::Movement>();
                    movement->updateIntraMovementTime(std::chrono::microseconds(input.elapsedtime()));
                    m_reportThese.insert(entityId);
                }
                break;
                case shared::InputType::RotateLeft:
                    entities::rotateLeft(entity, std::chrono::microseconds(input.elapsedtime()));
                    m_reportThese.insert(entityId);
                    break;
                case shared::InputType::RotateRight:
                    entities::rotateRight(entity, std::chrono::microseconds(input.elapsedtime()));
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
    void Network::updateClients(const std::chrono::microseconds elapsedTime)
    {
        /*for (auto entityId : m_reportThese)
        {
            auto entity = m_entities[entityId];
            auto message = std::make_shared<messages::UpdateEntity>(entity, elapsedTime);
            MessageQueueServer::instance().broadcastMessageWithLastId(message);
        }*/
        m_reportThese.clear();

        //
        // Alternative approach to reduce discrepences between server and client
        // is to update the client with everything everytime.
        for (auto& [entityId, entity] : m_entities)
        {
            auto message = std::make_shared<messages::UpdateEntity>(entity, elapsedTime);
            MessageQueueServer::instance().broadcastMessageWithLastId(message);
        }
        //
        // Better approach (not coded yet)
        // Send a single message with a snapshot of the game state to each client
        // rather than individual entity update messages.
    }
} // namespace systems
