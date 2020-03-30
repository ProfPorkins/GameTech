#pragma once

#include "components/AnimatedSprite.hpp"
#include "systems/System.hpp"

#include <chrono>

namespace systems
{
    // --------------------------------------------------------------
    //
    // This system is used to update animated sprites.
    //
    // --------------------------------------------------------------
    class Animation : public System
    {
      public:
        Animation() :
            System({ctti::unnamed_type_id<components::AnimatedSprite>()})
        {
        }

        virtual void update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now) override;
    };
} // namespace systems
