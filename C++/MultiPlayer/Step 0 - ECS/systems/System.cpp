#include "System.hpp"

#include <algorithm>

// --------------------------------------------------------------
//
// All systems are asked if they are interested in an entity.  This
// is to allow each system to have its own set of entities, making
// traversal of them during update more efficient.
//
// --------------------------------------------------------------
bool System::isInterested(Entity* entity)
{
    auto iCareIfAll = std::all_of(
        m_interests.begin(), m_interests.end(),
        [&entity](auto interest) {
            return entity->getComponents().find(interest) != entity->getComponents().end();
        });

    return iCareIfAll;
}
