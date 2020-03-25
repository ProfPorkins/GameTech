#include "Damage.hpp"

#include "MessageQueueServer.hpp"
#include "components/Health.hpp"
#include "components/Weapon.hpp"
#include "entities/Create.hpp"
#include "messages/NewEntity.hpp"
#include "messages/RemoveEntity.hpp"
#include "messages/Utility.hpp"

#include <cmath>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Because we maintain our own list of entities, need to ensure
    // they are removed from the containers.
    //
    // --------------------------------------------------------------
    void Damage::removeEntity(entities::Entity::IdType entityId)
    {
        System::removeEntity(entityId);
        m_entitiesDamage.erase(entityId);
        m_entitiesHealth.erase(entityId);
    }

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
        for (auto&& weaponId : m_entitiesDamage)
        {
            auto weapon = m_entities[weaponId];
            for (auto&& entityId : m_entitiesHealth)
            {
                auto entity = m_entities[entityId];
                if (weapon->getComponent<components::Weapon>()->getOwnerId() != entity->getId())
                {
                    if (collides(weapon.get(), entity.get()))
                    {
                        //
                        // Note: Not really removing other players when their health goes to 0, but
                        // just writing some code that shows how to use the health and weapon components
                        // to accomplish that.
                        auto health = entity->getComponent<components::Health>();
                        auto damage = weapon->getComponent<components::Weapon>();
                        health->update(-damage->getDamage());
                        if (health->get() <= 0)
                        {
                            // The 'entity' would be remove in this case, but not actually doing that
                            // in this demonstration.
                        }
                        //
                        // 1.  The weapon entity needs to be removed from all connected clients
                        //     and the local server simulation
                        auto message = std::make_shared<messages::RemoveEntity>(weaponId);
                        MessageQueueServer::instance().broadcastMessage(message);
                        m_handlerRemoveEntity(weaponId);
                        //
                        // 2.  An explosion entity needs to be sent to the connected clients
                        notifyExplosion(entity->getComponent<components::Position>()->get());
                    }
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

    // --------------------------------------------------------------
    //
    // Checks for a collision between two entities.
    //
    // --------------------------------------------------------------
    bool Damage::collides(entities::Entity* e1, entities::Entity* e2)
    {
        auto position1 = e1->getComponent<components::Position>();
        auto position2 = e2->getComponent<components::Position>();
        auto size1 = e1->getComponent<components::Size>();
        auto size2 = e2->getComponent<components::Size>();

        auto distance = std::sqrt(std::pow(position1->get().x - position2->get().x, 2) + std::pow(position1->get().y - position2->get().y, 2));
        // MOTHER OF ASSUPTIONS: x/y are the same and we are using circle collision detection
        auto radii = size1->get().x + size2->get().x;

        return distance <= radii;
    }

    // --------------------------------------------------------------
    //
    // Sends the explosion entity out to all connected clients.
    //
    // --------------------------------------------------------------
    void Damage::notifyExplosion(math::Vector2f location)
    {
        //
        // This was just temporary while I worked on the animated sprite component
        // for explosions.
        auto fiftyMS = std::chrono::milliseconds(50);
        auto frameTimes = {fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS, fiftyMS};
        auto explosion = entities::explosion::create("explosion.png", location, 0.07f, frameTimes);
        auto pbExplosion = messages::createPBEntity(explosion);
        MessageQueueServer::instance().broadcastMessage(std::make_shared<messages::NewEntity>(pbExplosion));
    }

} // namespace systems
