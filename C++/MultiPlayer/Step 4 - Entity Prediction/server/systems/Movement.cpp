#include "Movement.hpp"

#include <SFML/System/Vector2.hpp>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Process all outstanding messages since the last update.
    //
    // --------------------------------------------------------------
    void Movement::update(std::chrono::milliseconds elapsedTime)
    {
        for (auto&& [id, entity] : m_entities)
        {
            auto position = entity->getComponent<components::Position>();
            auto movement = entity->getComponent<components::Movement>();

            auto current = position->get();
            position->set(sf::Vector2f(
                current.x + movement->getMomentum().x * elapsedTime.count(),
                current.y + movement->getMomentum().y * elapsedTime.count()));
        }
    }

} // namespace systems
