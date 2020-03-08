#pragma once

#include "components/Component.hpp"

#include <chrono>
#include <string>
#include <vector>

// --------------------------------------------------------------
//
// Specifies the an animated visual appearance.
//
// --------------------------------------------------------------
namespace components
{
    class AnimatedAppearance : public Component
    {
      public:
        AnimatedAppearance(std::string texture, std::vector<std::chrono::milliseconds> spriteTime) :
            m_texture(texture),
            m_spriteTime(spriteTime)
        {
        }

        auto getTexture() { return m_texture; }
        const auto& getSpriteTime() { return m_spriteTime; }

      private:
        std::string m_texture;
        std::vector<std::chrono::milliseconds> m_spriteTime;
    };
} // namespace components
