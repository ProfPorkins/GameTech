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
    // This system is used perform entity movement, which includes
    // entity interpolation and entity prediction.
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

        virtual bool addEntity(std::shared_ptr<entities::Entity> entity) override;
        virtual void update(std::chrono::microseconds elapsedTime) override;

      private:
    };
} // namespace systems
