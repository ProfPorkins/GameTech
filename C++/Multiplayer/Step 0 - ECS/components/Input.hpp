#pragma once

#include <cstdint>
#include <initializer_list>
#include <unordered_set>

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
            Forward,
            Backward,
            TurnLeft,
            TurnRight,
            FireWeapon
        };

        Input(std::initializer_list<Type> inputs) :
            m_inputs(inputs)
        {
        }

        const auto& getInputs() { return m_inputs; }

      private:
        std::unordered_set<Type> m_inputs;
    };
} // namespace components
