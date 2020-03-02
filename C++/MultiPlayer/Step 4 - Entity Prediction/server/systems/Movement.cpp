#include "Movement.hpp"

#include <SFML/System/Vector2.hpp>

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

            auto current = position->get();
            position->set(sf::Vector2f(
                current.x + movement->getMomentum().x * (elapsedTime - movement->getUpdateDiff()).count(),
                current.y + movement->getMomentum().y * (elapsedTime - movement->getUpdateDiff()).count()));
            movement->setUpdateDiff(std::chrono::milliseconds(0));
        }
    }

} // namespace systems
