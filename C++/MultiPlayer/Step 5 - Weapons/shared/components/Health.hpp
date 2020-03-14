#pragma once

#include "components/Component.hpp"

// --------------------------------------------------------------
//
// Specifies the amount of heath for an entity.
//
// --------------------------------------------------------------
namespace components
{
    class Health : public Component
    {
      public:
          Health(float health) :
            m_health(health)
        {
        }

        auto get() { return m_health; }

      private:
          float m_health;
    };
} // namespace components
