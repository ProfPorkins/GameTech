#pragma once

#include "components/Component.hpp"

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
        Movement(float moveRate, float rotateRate) :
            m_moveRate(moveRate),
            m_rotateRate(rotateRate)
        {
        }

        const float getMoveRate() const { return m_moveRate; }
        const float getRotateRate() const { return m_rotateRate; }

      private:
        float m_moveRate;   // unit distance per millisecond
        float m_rotateRate; // degrees per millisecond
    };
} // namespace components
