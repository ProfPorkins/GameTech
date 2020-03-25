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
        updateClients();
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
                    entities::thrust(entity, std::chrono::milliseconds(input.elapsedtime()));
                    m_reportThese.insert(entity->getId());
                    break;
                case shared::InputType::RotateLeft:
                    entities::rotateLeft(entity, std::chrono::milliseconds(input.elapsedtime()));
                    m_reportThese.insert(entity->getId());
                    break;
                case shared::InputType::RotateRight:
                    entities::rotateRight(entity, std::chrono::milliseconds(input.elapsedtime()));
                    m_reportThese.insert(entity->getId());
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
    void Network::updateClients()
    {
        for (auto entityId : m_reportThese)
        {
            auto entity = m_entities[entityId];
            auto message = std::make_shared<messages::UpdateEntity>(entity);
            MessageQueueServer::instance().broadcastMessageWithLastId(message);
        }

        m_reportThese.clear();
    }
} // namespace systems
