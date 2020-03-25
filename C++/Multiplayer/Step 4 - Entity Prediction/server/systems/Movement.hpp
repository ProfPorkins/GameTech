#pragma once

#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "entities/Entity.hpp"
#include "systems/System.hpp"

#include <chrono>
#include <cstdint>
#include <memory>

namespace systems
{
    // --------------------------------------------------------------
    //
    // This system is used perform entity movement.
    //
    // --------------------------------------------------------------
    class Movement : public System
    {
      public:
        Movement() :
            System({ctti::unnamed_type_id<components::Position>(),
                    ctti::unnamed_type_id<components::Movement>()})
        {
        }

        virtual void update(std::chrono::microseconds elapsedTime) override;

      private:
    };
} // namespace systems
