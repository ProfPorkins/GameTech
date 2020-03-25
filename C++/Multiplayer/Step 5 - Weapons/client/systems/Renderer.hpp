#pragma once

#include "components/AnimatedSprite.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Sprite.hpp"
#include "systems/System.hpp"

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
            System({ctti::unnamed_type_id<components::Position>(),
                    ctti::unnamed_type_id<components::Size>()})
        {
        }

        void update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<sf::RenderTarget> renderTarget);

      protected:
        virtual bool isInterested(entities::Entity* entity) override;

      private:
    };
} // namespace systems
