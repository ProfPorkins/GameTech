#pragma once

#include "components/Component.hpp"

#include <cstdint>
#include <initializer_list>
#include <unordered_set>
#include <chrono>

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

        Input(const std::initializer_list<Type>& inputs) :
            m_inputs(inputs)
        {
        }

        Input(const std::vector<Type>& inputs) :
            m_inputs(inputs.begin(), inputs.end())
        {
        }

        const auto& getInputs() { return m_inputs; }
        void setLastPredictTime(std::chrono::system_clock::time_point time) { m_lastPredictTime = time; }
        auto getLastInputTime() { return m_lastPredictTime; }

      private:
        std::unordered_set<Type> m_inputs;
        std::chrono::system_clock::time_point m_lastPredictTime{ std::chrono::system_clock::now() };
    };
} // namespace components
