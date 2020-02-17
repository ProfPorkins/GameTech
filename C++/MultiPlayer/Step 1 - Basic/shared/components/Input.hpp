#pragma once

#include "components/Component.hpp"

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

      private:
        std::unordered_set<Type> m_inputs;
    };
} // namespace components
