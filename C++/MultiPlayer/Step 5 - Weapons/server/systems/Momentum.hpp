#pragma once

#include "components/Momentum.hpp"
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
    // This system is used move entities based on their momentum.
    //
    // --------------------------------------------------------------
    class Momentum : public System
    {
      public:
        Momentum() :
            System({ctti::unnamed_type_id<components::Position>(),
                    ctti::unnamed_type_id<components::Momentum>()})
        {
        }

        virtual void update(std::chrono::microseconds elapsedTime) override;

      private:
    };
} // namespace systems
