#include "Momentum.hpp"

#include "entities/Update.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Move all entities.
    //
    // --------------------------------------------------------------
    void Momentum::update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now)
    {
        (void)now;
        for (auto&& [id, entity] : m_entities)
        {
            //
            // If the entity already has some drift computed due to network
            // thrust, that amount of time must be subtracted from the server's
            // update window.
            auto momentum = entity->getComponent<components::Momentum>();
            entities::drift(entity.get(), elapsedTime - momentum->getIntraMovementTime());
            momentum->resetIntraMovementTime();
        }
    }

} // namespace systems
