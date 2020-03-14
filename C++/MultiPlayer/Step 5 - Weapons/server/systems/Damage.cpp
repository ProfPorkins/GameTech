#include "Damage.hpp"

#include "components/Weapon.hpp"
#include "components/Health.hpp"

#include <cmath>
#include <iostream>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Check for collisions between entities that cause damage and those
    // that have health.
    //
    // --------------------------------------------------------------
    void Damage::update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now)
    {
        (void)now;
        (void)elapsedTime;
        //for (auto&& [id, entity] : m_entities)
        //{
        //    //
        //    // If the entity already has some drift computed due to network
        //    // thrust, that amount of time must be subtracted from the server's
        //    // update window.
        //    auto momentum = entity->getComponent<components::Momentum>();
        //    entities::drift(entity.get(), elapsedTime - momentum->getIntraMovementTime());
        //    momentum->resetIntraMovementTime();
        //}
        //
        // Just a simple n^2 algorithm, good enough for this demo
        for (auto&& weapon : m_entitiesDamage)
        {
            for (auto&& entity : m_entitiesHealth)
            {
                if (collides(m_entities[weapon].get(), m_entities[entity].get()))
                {
                    std::cout << "collided!" << std::endl;
                }
            }
        }
    }

    // --------------------------------------------------------------
    //
    // This system can is interested in entities with either health
    // or weapon.
    //
    // --------------------------------------------------------------
    bool Damage::isInterested(entities::Entity* entity)
    {
        if (System::isInterested(entity))
        {
            if (entity->hasComponent<components::Health>())
            {
                m_entitiesHealth.insert(entity->getId());
                return true;
            }
            if (entity->hasComponent<components::Weapon>())
            {
                m_entitiesDamage.insert(entity->getId());
                return true;
            }
        }

        return false;
    }

    bool Damage::collides(entities::Entity* e1, entities::Entity* e2)
    {
        auto position1 = e1->getComponent<components::Position>();
        auto position2 = e2->getComponent<components::Position>();
        auto size1 = e1->getComponent<components::Size>();
        auto size2 = e2->getComponent<components::Size>();

        auto distance = std::sqrt(std::pow(position1->get().x - position2->get().y, 2) + std::pow(position1->get().x - position2->get().y, 2));
        // MOTHER OF ASSUPTIONS: x/y are the same and we are using circle collision detection
        auto radii = size1->get().x + size2->get().y;

        return distance <= radii;
    }

} // namespace systems
