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
        Movement(float thrustRate, float rotateRate) :
            m_thrustRate(thrustRate),
            m_rotateRate(rotateRate)
        {
        }

        const float getThrustRate() const { return m_thrustRate; }
        const float getRotateRate() const { return m_rotateRate; }

      private:
        float m_thrustRate; // unit distance per millisecond
        float m_rotateRate; // degrees per millisecond
    };
} // namespace components
