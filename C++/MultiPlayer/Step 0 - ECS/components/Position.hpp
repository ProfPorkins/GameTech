#pragma once

#include "Component.hpp"

#include <SFML/System/Vector2.hpp>

// --------------------------------------------------------------
//
// Specifies the game world location.
//
// --------------------------------------------------------------
namespace components
{
    class Position : public Component
    {
      public:
        Position(sf::Vector2f position, float orientation = 0.0f) :
            m_position(position),
            m_orientation(orientation)
        {
        }

        auto get() { return m_position; }
        auto set(sf::Vector2f position) { m_position = position; }
        auto getOrientation() { return m_orientation; }
        void setOrientation(float orientation) { m_orientation = orientation; }

      private:
        sf::Vector2f m_position;
        float m_orientation;
    };
} // namespace components
