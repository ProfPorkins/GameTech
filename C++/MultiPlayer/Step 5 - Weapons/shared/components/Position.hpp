#pragma once

#include "components/Component.hpp"
#include "misc/math.hpp"

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
        Position(math::Vector2f position, float orientation = 0.0f) :
            m_position(position),
            m_orientation(orientation)
        {
        }

        auto get() { return m_position; }
        auto set(math::Vector2f position) { m_position = position; }
        auto getOrientation() { return m_orientation; }
        void setOrientation(float orientation) { m_orientation = orientation; }

        void resetEntityPrediction() { m_needsEntityPrediction = false; }
        auto getNeedsEntityPrediction() { return m_needsEntityPrediction; }
        void setLastServerUpdate(const std::chrono::system_clock::time_point now)
        {
            m_lastServerUpdate = now;
            m_needsEntityPrediction = true;
        }
        auto getLastServerUpdate() { return m_lastServerUpdate; }
        void setLastClientUpdate(const std::chrono::system_clock::time_point now) { m_lastClientUpdate = now; }
        auto getLastClientUpdate() { return m_lastClientUpdate; }

      private:
        math::Vector2f m_position;
        float m_orientation;
        std::chrono::system_clock::time_point m_lastServerUpdate{std::chrono::system_clock::now()};
        std::chrono::system_clock::time_point m_lastClientUpdate{std::chrono::system_clock::now()};
        bool m_needsEntityPrediction = false;
    };
} // namespace components
