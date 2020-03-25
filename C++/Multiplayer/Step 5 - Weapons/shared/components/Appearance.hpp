#pragma once

#include "components/Component.hpp"

#include <string>

// --------------------------------------------------------------
//
// Specifies the visual appearance.
//
// --------------------------------------------------------------
namespace components
{
    class Appearance : public Component
    {
      public:
        Appearance(std::string texture) :
            m_texture(texture)
        {
        }

        auto getTexture() { return m_texture; }

      private:
        std::string m_texture;
    };
} // namespace components
