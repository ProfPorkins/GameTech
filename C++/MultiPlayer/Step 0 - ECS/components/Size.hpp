#pragma once

#include "Component.hpp"

#include <SFML/System/Vector2.hpp>

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
        Size(sf::Vector2f size) :
            m_size(size)
        {
        }

        auto get() { return m_size; }

      private:
        sf::Vector2f m_size;
    };
} // namespace components
