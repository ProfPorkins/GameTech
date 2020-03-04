#include "Movement.hpp"

#include <SFML/System/Vector2.hpp>
#include <chrono>
#include <iostream>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Move all entities.
    //
    // --------------------------------------------------------------
    void Movement::update(std::chrono::milliseconds elapsedTime)
    {
        for (auto&& [id, entity] : m_entities)
        {
            auto position = entity->getComponent<components::Position>();
            auto movement = entity->getComponent<components::Movement>();

            //
            // Have to subtract off time already simulated in the Network system.
            // If it turns out the Network system simulated more time than is available
            // for this update at the server, forward it to the next update.
            auto howMuch = elapsedTime - movement->getUpdateDiff();
            if (howMuch < std::chrono::milliseconds(0))
            {
                // This means the Network system simulated more movement than is available
                // at this step on the server.
                // That extra time already simulated in the Network system needs to be
                // carried forward into the next update.
                movement->setUpdateDiff(movement->getUpdateDiff() - elapsedTime);
                howMuch = std::chrono::milliseconds(0);
            }
            else
            {
                movement->setUpdateDiff(std::chrono::milliseconds(0));
            }
            std::cout << "simulating: " << howMuch.count() << std::endl;
            auto current = position->get();
            position->set(sf::Vector2f(
                current.x + movement->getMomentum().x * howMuch.count(),
                current.y + movement->getMomentum().y * howMuch.count()));
            std::cout << "after: (" << position->get().x << ", " << position->get().y << ")" << std::endl;
        }
    }

} // namespace systems
