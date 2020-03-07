#pragma once

#include "components/Component.hpp"
#include "misc/math.hpp"

// --------------------------------------------------------------
//
// Specifies the game world size.
//
// --------------------------------------------------------------
namespace components
{
    class Size : public Component
    {
      public:
        Size(math::Vector2f size) :
            m_size(size)
        {
        }

        auto get() { return m_size; }

      private:
        math::Vector2f m_size;
    };
} // namespace components
