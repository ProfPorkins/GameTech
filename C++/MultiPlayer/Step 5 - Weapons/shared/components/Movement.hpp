#pragma once

#include "components/Component.hpp"

#include <SFML/System/Vector2.hpp>
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
        Movement(float thrustRate, float rotateRate, sf::Vector2f momentum) :
            m_thrustRate(thrustRate),
            m_rotateRate(rotateRate),
            m_momentum(momentum)
        {
        }

        const float getThrustRate() const { return m_thrustRate; }
        const float getRotateRate() const { return m_rotateRate; }
        const sf::Vector2f getMomentum() const { return m_momentum; }
        void setMomentum(sf::Vector2f momentum) { m_momentum = momentum; }

        void resetIntraMovementTime() { m_intraMovementTime = {0}; }
        auto getIntraMovementTime() { return m_intraMovementTime; }
        void updateIntraMovementTime(std::chrono::milliseconds howMuch) { m_intraMovementTime += howMuch; }

      private:
        float m_thrustRate;      // unit distance per millisecond
        float m_rotateRate;      // degrees per millisecond
        sf::Vector2f m_momentum; // units per millisecond
        std::chrono::milliseconds m_intraMovementTime{0};
    };
} // namespace components
