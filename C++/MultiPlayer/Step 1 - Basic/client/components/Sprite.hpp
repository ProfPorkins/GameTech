#pragma once

#include "components/Component.hpp"

#include <SFML/Graphics.hpp>
#include <memory>

// --------------------------------------------------------------
//
// Specifies the visual appearance.
//
// --------------------------------------------------------------
namespace components
{
    class Sprite : public Component
    {
      public:
        Sprite(std::shared_ptr<sf::Sprite> sprite) :
            m_sprite(sprite)
        {
        }

        auto get() { return m_sprite; }

      private:
        std::shared_ptr<sf::Sprite> m_sprite;
    };
} // namespace components
