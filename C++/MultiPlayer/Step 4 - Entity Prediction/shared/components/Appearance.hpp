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

        auto get() { return m_texture; }
        void set(std::string texture) { m_texture = texture; }

      private:
        std::string m_texture;
    };
} // namespace components
