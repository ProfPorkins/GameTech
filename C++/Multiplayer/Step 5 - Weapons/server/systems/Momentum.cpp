#include "Momentum.hpp"

#include "entities/Update.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Move all entities.
    //
    // --------------------------------------------------------------
    void Momentum::update(std::chrono::microseconds elapsedTime, [[maybe_unused]] const std::chrono::system_clock::time_point now)
    {
        for (auto&& [id, entity] : m_entities)
        {
            (void)id; // unused
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
