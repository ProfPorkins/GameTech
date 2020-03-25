#include "Movement.hpp"

#include "entities/Player.hpp"

#include <SFML/System/Vector2.hpp>
#include <chrono>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Move all entities.
    //
    // --------------------------------------------------------------
    void Movement::update(std::chrono::microseconds elapsedTime)
    {
        for (auto&& [id, entity] : m_entities)
        {
            //
            // If the entity already has some drift computed due to network
            // thrust, that amount of time must be subtracted from the server's
            // update window.
            auto movement = entity->getComponent<components::Movement>();
            entities::drift(entity.get(), elapsedTime - movement->getIntraMovementTime());
            movement->resetIntraMovementTime();
        }
    }

} // namespace systems
