#include "Player.hpp"

#include "components/Appearance.hpp"
#include "components/Input.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"

namespace entities::player
{
    // --------------------------------------------------------------
    //
    // Server-side function to create a new player entity.
    //
    // --------------------------------------------------------------
    std::shared_ptr<Entity> create(std::string texture, math::Vector2f position, float size, float thrustRate, float rotateRate, math::Vector2f momentum)
    {
        //
        // Have to convert momentum to microseconds from milliseconds
        constexpr float MS_TO_US = static_cast<float>(std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::milliseconds(1)).count());

        std::shared_ptr<Entity> entity = std::make_shared<Entity>();

        entity->addComponent(std::make_unique<components::Appearance>(texture));

        //
        // A player ship has the following components
        entity->addComponent(std::make_unique<components::Position>(position));
        entity->addComponent(std::make_unique<components::Size>(math::Vector2f(size, size)));
        entity->addComponent(std::make_unique<components::Movement>(
            thrustRate / MS_TO_US, // thrustRate comes in per milliecond
            rotateRate / MS_TO_US, // rotateRate comes in per millisecond
            momentum));

        auto inputs = {
            components::Input::Type::Thrust,
            components::Input::Type::RotateLeft,
            components::Input::Type::RotateRight};
        entity->addComponent(std::make_unique<components::Input>(inputs));

        return entity;
    }
} // namespace entities::player

// --------------------------------------------------------------
//
// The following functions are shared between the client and server,
// they are used to handle input on the player entity for either
// server or client simulation.
//
// --------------------------------------------------------------
namespace entities
{
    void thrust(entities::Entity* entity, std::chrono::microseconds howLong)
    {
        const float PI = 3.14159f;
        const float DEGREES_TO_RADIANS = PI / 180.0f;

        auto position = entity->getComponent<components::Position>();
        auto movement = entity->getComponent<components::Movement>();

        auto vectorX = std::cos(position->getOrientation() * DEGREES_TO_RADIANS);
        auto vectorY = std::sin(position->getOrientation() * DEGREES_TO_RADIANS);

        auto current = movement->getMomentum();
        movement->setMomentum(math::Vector2f(
            current.x + static_cast<float>(vectorX * movement->getThrustRate() * howLong.count()),
            current.y + static_cast<float>(vectorY * movement->getThrustRate() * howLong.count())));
    }

    void rotateLeft(entities::Entity* entity, std::chrono::microseconds howLong)
    {
        auto position = entity->getComponent<components::Position>();
        auto movement = entity->getComponent<components::Movement>();

        position->setOrientation(position->getOrientation() - movement->getRotateRate() * howLong.count());
    }

    void rotateRight(entities::Entity* entity, std::chrono::microseconds howLong)
    {
        auto position = entity->getComponent<components::Position>();
        auto movement = entity->getComponent<components::Movement>();

        position->setOrientation(position->getOrientation() + movement->getRotateRate() * howLong.count());
    }

    void drift(entities::Entity* entity, std::chrono::microseconds howLong)
    {
        auto position = entity->getComponent<components::Position>();
        auto movement = entity->getComponent<components::Movement>();

        auto current = position->get();
        position->set(math::Vector2f(
            current.x + movement->getMomentum().x * howLong.count(),
            current.y + movement->getMomentum().y * howLong.count()));
    }
} // namespace entities
