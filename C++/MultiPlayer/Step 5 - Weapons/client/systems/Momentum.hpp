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
    // This system is used perform entity movement, which includes
    // entity interpolation and entity prediction.
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

        virtual bool addEntity(std::shared_ptr<entities::Entity> entity) override;
        virtual void update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now) override;

      private:
    };
} // namespace systems
