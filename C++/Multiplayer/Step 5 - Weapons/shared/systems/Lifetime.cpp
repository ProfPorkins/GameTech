
#include "Lifetime.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Update how long the entity has been alive and if it has expired,
    // notify the game model.
    //
    // --------------------------------------------------------------
    void Lifetime::update(std::chrono::microseconds elapsedTime, [[maybe_unused]] const std::chrono::system_clock::time_point now)
    {
        for (auto&& [id, entity] : m_entities)
        {
            auto lifetime = entity->getComponent<components::Lifetime>();
            lifetime->update(elapsedTime);
            if (lifetime->get().count() <= 0)
            {
                m_notifyRemove(id);
            }
        }
    }

} // namespace systems
