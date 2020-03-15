#include "Explosion.hpp"

#include "components/AnimatedAppearance.hpp"
#include "components/Lifetime.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"

#include <numeric>

namespace entities::explosion
{
    // --------------------------------------------------------------
    //
    // Server-side function to create a new explosion entity.
    //
    // --------------------------------------------------------------
    std::shared_ptr<Entity> create(std::string texture, math::Vector2f position, float size, std::vector<std::chrono::milliseconds> spriteTime)
    {
        std::shared_ptr<Entity> entity = std::make_shared<Entity>();

        //
        // An explosion has the following components
        entity->addComponent(std::make_unique<components::Position>(position));
        entity->addComponent(std::make_unique<components::Size>(math::Vector2f(size, size)));
        entity->addComponent(std::make_unique<components::AnimatedAppearance>(texture, spriteTime));
        //
        // Add all the sprite frame times to get the total lifetime of the explosion
        auto totalFrametime = std::accumulate(spriteTime.begin(), spriteTime.end(), std::chrono::milliseconds(0));
        totalFrametime -= spriteTime.back();
        entity->addComponent(std::make_unique<components::Lifetime>(totalFrametime));

        return entity;
    }
} // namespace entities::explosion
