#include "System.hpp"

#include <algorithm>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Each system maintains a list of entities it has a responsibility
    // to perform an update on.
    //
    // --------------------------------------------------------------
    bool System::addEntity(std::shared_ptr<entities::Entity> entity)
    {
        if (isInterested(entity.get()))
        {
            m_entities[entity->getId()] = entity;
            return true;
        }

        return false;
    }

    // --------------------------------------------------------------
    //
    // All systems must be given a chance to remove an entity.
    //
    // --------------------------------------------------------------
    void System::removeEntity(entities::Entity::IdType entityId)
    {
        m_entities.erase(entityId);
    }

    // --------------------------------------------------------------
    //
    // All systems are asked if they are interested in an entity.  This
    // is to allow each system to have its own set of entities, making
    // traversal of them during update more efficient.
    //
    // --------------------------------------------------------------
    bool System::isInterested(entities::Entity* entity)
    {
        auto iCareIfAll = std::all_of(
            m_interests.begin(), m_interests.end(),
            [&entity](auto interest) {
                return entity->getComponents().find(interest) != entity->getComponents().end();
            });

        return iCareIfAll;
    }
} // namespace systems
