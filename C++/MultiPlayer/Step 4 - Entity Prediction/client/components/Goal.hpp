#pragma once

#include "components/Component.hpp"
#include "misc/math.hpp"

#include <chrono>

// --------------------------------------------------------------
//
// Specifies the starting and ending points for an interploated entity.
//
// --------------------------------------------------------------
namespace components
{
    class Goal : public Component
    {
      public:
        Goal(math::Vector2f position, float orientation) :
            m_startPosition(position),
            m_goalPosition(position),
            m_startOrientation(orientation),
            m_goalOrientation(orientation)
        {
        }

        auto getStartPosition() { return m_startPosition; }
        auto getGoalPosition() { return m_goalPosition; }
        auto getStartOrientation() { return m_startOrientation; }
        auto getGoalOrientation() { return m_goalOrientation; }
        auto getUpdateWindow() { return m_updateWindow; }
        auto getUpdatedTime() { return m_updatedTime; }

        void setStartPosition(math::Vector2f position) { m_startPosition = position; }
        void setGoalPosition(math::Vector2f position) { m_goalPosition = position; }
        void setStartOrientation(float orientation) { m_startOrientation = orientation; }
        void setGoalOrientation(float orientation) { m_goalOrientation = orientation; }
        void setUpdateWindow(std::chrono::microseconds updateWindow) { m_updateWindow = updateWindow; }
        void setUpdatedTime(std::chrono::microseconds updatedTime) { m_updatedTime = updatedTime; }

      private:
        math::Vector2f m_startPosition;
        math::Vector2f m_goalPosition;
        float m_startOrientation;
        float m_goalOrientation;
        std::chrono::microseconds m_updateWindow{0};
        std::chrono::microseconds m_updatedTime{0};
    };
} // namespace components
