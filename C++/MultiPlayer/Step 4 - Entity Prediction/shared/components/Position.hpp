#pragma once

#include "components/Component.hpp"

#include <SFML/System/Vector2.hpp>
#include <chrono>

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

        void resetEntityPrediction() { m_needsEntityPrediction = false; }
        auto getNeedsEntityPrediction() { return m_needsEntityPrediction; }
        void setLastServerUpdate()
        {
            m_lastServerUpdate = std::chrono::system_clock::now();
            m_needsEntityPrediction = true;
        }
        auto getLastServerUpdate() { return m_lastServerUpdate; }
        void setLastClientUpdate() { m_lastClientUpdate = std::chrono::system_clock::now(); }
        auto getLastClientUpdate() { return m_lastClientUpdate; }

      private:
        sf::Vector2f m_position;
        float m_orientation;
        std::chrono::system_clock::time_point m_lastServerUpdate{std::chrono::system_clock::now()};
        std::chrono::system_clock::time_point m_lastClientUpdate{std::chrono::system_clock::now()};
        bool m_needsEntityPrediction = false;
    };
} // namespace components
