#include "Create.hpp"

#include "components/AnimatedAppearance.hpp"
#include "components/Appearance.hpp"
#include "components/Health.hpp"
#include "components/Input.hpp"
#include "components/Lifetime.hpp"
#include "components/Momentum.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Weapon.hpp"

#include <numeric>
#include <utility>

namespace entities::player
{
    // --------------------------------------------------------------
    //
    // Server-side function to create a new player entity.
    //
    // --------------------------------------------------------------
    std::shared_ptr<Entity> create(std::string texture, math::Vector2f position, float size, float thrustRate, float rotateRate, math::Vector2f momentum, float health)
    {
        //
        // Have to convert momentum to microseconds from milliseconds
        constexpr float MS_TO_US = static_cast<float>(std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::milliseconds(1)).count());

        std::shared_ptr<Entity> entity = std::make_shared<Entity>();

        //
        // A player ship has the following components
        entity->addComponent(std::make_unique<components::Appearance>(texture));

        entity->addComponent(std::make_unique<components::Position>(position));
        entity->addComponent(std::make_unique<components::Size>(math::Vector2f(size, size)));
        entity->addComponent(std::make_unique<components::Movement>(
            thrustRate / MS_TO_US,   // thrustRate comes in per milliecond
            rotateRate / MS_TO_US)); // rotateRate comes in per millisecond

        entity->addComponent(std::make_unique<components::Momentum>(momentum));
        entity->addComponent(std::make_unique<components::Health>(health));

        auto inputs = {
            std::make_pair(components::Input::Type::Thrust, std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::milliseconds(0))),
            std::make_pair(components::Input::Type::RotateLeft, std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::milliseconds(0))),
            std::make_pair(components::Input::Type::RotateRight, std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::milliseconds(0))),
            std::make_pair(components::Input::Type::FireWeapon, std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::milliseconds(250)))};
        entity->addComponent(std::make_unique<components::Input>(inputs));

        return entity;
    }
} // namespace entities::player

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
