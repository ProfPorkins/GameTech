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
                        [this](std::uint64_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
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
                        [this](std::uint64_t clientId, std::chrono::milliseconds elapsedTime, std::shared_ptr<messages::Message> message) {
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
    void Network::update(std::chrono::milliseconds elapsedTime, std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> messages)
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
    void Network::registerHandler(messages::Type type, std::function<void(std::uint64_t, std::chrono::milliseconds, std::shared_ptr<messages::Message>)> handler)
    {
        m_commandMap[type] = handler;
    }

    // --------------------------------------------------------------
    //
    // Handler for the Input message.  This simply passes the responsibility
    // to the registered input handler.
    //
    // BIG HUGE IMPORTANT NOTE
    // The client runs at a different simulation rate from the server.  The client
    // runs at whatever frame rate it runs at.  As long as the player holds down
    // the thrust, for example, thrust is applied for that frame and movement is
    // applied during that same frame at the new momentum.  At the server, all of
    // the thrust messages are applied, resulting in a new momentum.  Then after
    // those are applied, momentum is simulated at the final thrust, rather than
    // at each of the different momentum levels in the same way the client performed
    // the simulation.  This leads to a difference in position between the client
    // and server.  Some solutions include...
    //  1.  Having the server (this system) simulate in a way similar to the client
    //  2.  Run the server simulation at a faster rate, but sending out client updates at a slower rate than the simulation
    //  3.  Send out a game state snapshot to each client, rather than sending out updates for only those clients who have new inputs
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
                    entities::thrust(entity, std::chrono::milliseconds(input.elapsedtime()));
                    //
                    // Simulate movement for this same amount of time to match what the client is doing.
                    // Then we have to subtract this amount of time from the entity so it doesn't get
                    // simulated in the movement system...yuck!
                    auto movement = entity->getComponent<components::Movement>();
                    auto position = entity->getComponent<components::Position>();

                    std::cout << "network: " << input.elapsedtime() << std::endl;
                    auto current = position->get();
                    position->set(sf::Vector2f(
                        current.x + movement->getMomentum().x * input.elapsedtime(),
                        current.y + movement->getMomentum().y * input.elapsedtime()));
                    movement->setUpdateDiff(movement->getUpdateDiff() + std::chrono::milliseconds(input.elapsedtime()));

                    m_reportThese.insert(entityId);
                }
                break;
                case shared::InputType::RotateLeft:
                    entities::rotateLeft(entity, std::chrono::milliseconds(input.elapsedtime()));
                    m_reportThese.insert(entityId);
                    break;
                case shared::InputType::RotateRight:
                    entities::rotateRight(entity, std::chrono::milliseconds(input.elapsedtime()));
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
    void Network::updateClients(const std::chrono::milliseconds elapsedTime)
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
    }
} // namespace systems
