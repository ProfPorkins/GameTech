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
    // This system is used perform entity interpolation.
    //
    // --------------------------------------------------------------
    class Interpolation : public System
    {
      public:
        Interpolation() :
            System({ctti::unnamed_type_id<components::Position>(),
                    ctti::unnamed_type_id<components::Movement>()})
        {
        }

        virtual bool addEntity(std::shared_ptr<entities::Entity> entity) override;
        virtual void update(std::chrono::milliseconds elapsedTime) override;
    };
} // namespace systems
