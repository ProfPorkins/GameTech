#pragma once

#include "components/Component.hpp"

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <initializer_list>
#include <unordered_map>

// --------------------------------------------------------------
//
// Identifies which inputs are active.
//
// --------------------------------------------------------------
namespace components
{
    class Input : public Component
    {
      public:
        enum class Type : std::uint8_t
        {
            Thrust,
            RotateLeft,
            RotateRight,
            FireWeapon
        };

        Input(const std::initializer_list<std::tuple<Type, std::chrono::microseconds>>& inputs)
        {
            for (auto& [type, time] : inputs)
            {
                m_inputs[type] = time;
                m_limitTime[type] = std::chrono::microseconds(0);
            }
        }

        Input(const std::vector<std::pair<Type, std::chrono::microseconds>>& inputs)
        {
            for (auto& [type, time] : inputs)
            {
                m_inputs[type] = time;
                m_limitTime[type] = std::chrono::microseconds(0);
            }
        }

        const auto& getInputs() { return m_inputs; }
        auto& getLimitTime() { return m_limitTime; }
        void resetLimit(Type type) { m_limitTime[type] = m_inputs[type]; }
        void updateLimits(std::chrono::microseconds howLong)
        {
            for (auto& [type, time] : m_limitTime)
            {
                time = std::max(time - howLong, std::chrono::microseconds(0));
            }
        }

      private:
        std::unordered_map<Type, std::chrono::microseconds> m_inputs;
        std::unordered_map<Type, std::chrono::microseconds> m_limitTime;
    };
} // namespace components
