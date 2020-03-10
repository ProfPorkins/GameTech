#include "Explosion.hpp"

#include "components/AnimatedAppearance.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"

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

        return entity;
    }
} // namespace entities::explosion
