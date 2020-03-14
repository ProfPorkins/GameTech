#pragma once

#include "components/Component.hpp"

// --------------------------------------------------------------
//
// Specifies the amount of damage the weapon causes.
//
// --------------------------------------------------------------
namespace components
{
    class Weapon : public Component
    {
      public:
        Weapon(float damage) :
            m_damage(damage)
        {
        }

        auto get() { return m_damage; }

      private:
          float m_damage;
    };
} // namespace components
