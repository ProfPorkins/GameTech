#pragma once

#include "components/Component.hpp"
#include "misc/math.hpp"

#include <chrono>

// --------------------------------------------------------------
//
// Holds details regarding momentum.
//
// --------------------------------------------------------------
namespace components
{
    class Momentum : public Component
    {
      public:
        Momentum(math::Vector2f momentum) :
            m_momentum(momentum)
        {
        }

        const math::Vector2f get() const { return m_momentum; }
        void set(math::Vector2f momentum) { m_momentum = momentum; }

        void resetIntraMovementTime() { m_intraMovementTime = {0}; }
        auto getIntraMovementTime() { return m_intraMovementTime; }
        void updateIntraMovementTime(std::chrono::microseconds howMuch) { m_intraMovementTime += howMuch; }

      private:
        math::Vector2f m_momentum; // units per millisecond
        std::chrono::microseconds m_intraMovementTime{0};
    };
} // namespace components
