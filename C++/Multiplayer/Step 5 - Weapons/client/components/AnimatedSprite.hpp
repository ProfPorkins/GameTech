#pragma once

#include "components/Component.hpp"

#include <SFML/Graphics.hpp>
#include <chrono>
#include <cstdint>
#include <memory>
#include <vector>

// --------------------------------------------------------------
//
// Specifies the visual appearance of an aminated sprite.
//
// --------------------------------------------------------------
namespace components
{
    class AnimatedSprite : public Component
    {
      public:
        AnimatedSprite(std::vector<std::shared_ptr<sf::Sprite>> sprites, std::vector<std::chrono::milliseconds> spriteTime) :
            m_sprites(sprites),
            m_spriteTime(spriteTime)
        {
        }

        void updateElapsedTime(std::chrono::microseconds howMuch) {
            m_elapsedTime += howMuch;
        }
        auto get() { return m_sprites[m_currentSprite]; }
        auto getCurrentSpriteTime() { return m_spriteTime[m_currentSprite]; };
        auto getElapsedTime() { return m_elapsedTime; }
        void incrementSprite() { m_currentSprite = (m_currentSprite + 1) % m_sprites.size(); }

      private:
        std::vector<std::shared_ptr<sf::Sprite>> m_sprites;
        std::vector<std::chrono::milliseconds> m_spriteTime;
        std::uint8_t m_currentSprite{0};
        std::chrono::microseconds m_elapsedTime{0};
    };
} // namespace components
