#pragma once

#include "entities/Entity.hpp"

#include <chrono>
#pragma warning(push) // Disable some compiler warnings that come from ctti
#pragma warning(disable : 4245)
#include <ctti/type_id.hpp>
#pragma warning(pop)
#include <initializer_list>
#include <unordered_set>

namespace systems
{
    // --------------------------------------------------------------
    //
    // A system is where all logic associated with the game is handled.
    // Each system is specialized to operate over a particular set of
    // entities, handling things like movement, collision detection,
    // and rendering.
    //
    // --------------------------------------------------------------
    class System
    {
      public:
        System(std::initializer_list<ctti::unnamed_type_id_t> list) :
            m_interests(list)
        {
        }

        virtual void addEntity(std::shared_ptr<entities::Entity> entity);
        virtual void removeEntity(decltype(entities::Entity().getId()) entityId);

        // The (void)elapsedTime is a technique to silence an unused parameter warning
        virtual void update(std::chrono::milliseconds elapsedTime) { (void)elapsedTime; }

      protected:
        entities::EntityMap m_entities;

      private:
        std::unordered_set<ctti::unnamed_type_id_t> m_interests;

        bool isInterested(entities::Entity* entity);
    };

} // namespace systems
