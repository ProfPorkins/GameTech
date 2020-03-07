#pragma once

#include "components/Component.hpp"
#include "misc/math.hpp"

#include <chrono>

// --------------------------------------------------------------
//
// Holds details regarding movement properties.
//
// --------------------------------------------------------------
namespace components
{
    class Movement : public Component
    {
      public:
        Movement(double thrustRate, float rotateRate, math::Vector2f momentum) :
            m_thrustRate(thrustRate),
            m_rotateRate(rotateRate),
            m_momentum(momentum)
        {
        }

        const double getThrustRate() const { return m_thrustRate; }
        const float getRotateRate() const { return m_rotateRate; }
        const math::Vector2f getMomentum() const { return m_momentum; }
        void setMomentum(math::Vector2f momentum) { m_momentum = momentum; }

        void resetIntraMovementTime() { m_intraMovementTime = {0}; }
        auto getIntraMovementTime() { return m_intraMovementTime; }
        void updateIntraMovementTime(std::chrono::microseconds howMuch) { m_intraMovementTime += howMuch; }

      private:
        double m_thrustRate;       // unit distance per microsecond
        float m_rotateRate;        // degrees per microsecond
        math::Vector2f m_momentum; // units per microsecond
        std::chrono::microseconds m_intraMovementTime{0};
    };
} // namespace components
