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
    void Movement::update(std::chrono::milliseconds elapsedTime)
    {
        for (auto&& [id, entity] : m_entities)
        {
            drift(entity.get(), elapsedTime);
        }
    }

} // namespace systems
