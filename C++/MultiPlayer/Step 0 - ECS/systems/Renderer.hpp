#pragma once

#include "System.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Sprite.hpp"

#include <SFML/Graphics/RenderTarget.hpp>
#include <chrono>
#include <memory>

namespace systems
{
    // --------------------------------------------------------------
    //
    // This system is used to render entities.
    //
    // --------------------------------------------------------------
    class Renderer : public System
    {
      public:
        Renderer() :
            System({ctti::unnamed_type_id<components::Sprite>(),
                    ctti::unnamed_type_id<components::Position>(),
                    ctti::unnamed_type_id<components::Size>()})
        {
        }

        void update(std::chrono::milliseconds elapsedTime, std::shared_ptr<sf::RenderTarget> renderTarget);

      private:
    };
} // namespace systems
