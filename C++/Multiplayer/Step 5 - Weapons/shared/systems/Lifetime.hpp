#pragma once

#include "components/Lifetime.hpp"
#include "systems/System.hpp"

#include <chrono>
#include <functional>

namespace systems
{
    // --------------------------------------------------------------
    //
    // This system is used to manage entities that have a lifetime.
    //
    // --------------------------------------------------------------
    class Lifetime : public System
    {
      public:
        Lifetime(std::function<void(entities::Entity::IdType entityId)> notifyRemove) :
            System({ctti::unnamed_type_id<components::Lifetime>()}),
            m_notifyRemove(notifyRemove)
        {
        }

        void update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now) override;

      private:
        std::function<void(entities::Entity::IdType entityId)> m_notifyRemove;
    };
} // namespace systems
