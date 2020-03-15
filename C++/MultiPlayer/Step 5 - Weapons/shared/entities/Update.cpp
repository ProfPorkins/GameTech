#include "Update.hpp"

#include "components/Appearance.hpp"
#include "components/Health.hpp"
#include "components/Input.hpp"
#include "components/Lifetime.hpp"
#include "components/Momentum.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Weapon.hpp"

#include <memory>

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
        auto position = entity->getComponent<components::Position>();
        auto movement = entity->getComponent<components::Movement>();
        auto momentum = entity->getComponent<components::Momentum>();

        auto vectorX = std::cos(position->getOrientation() * DEGREES_TO_RADIANS);
        auto vectorY = std::sin(position->getOrientation() * DEGREES_TO_RADIANS);

        auto current = momentum->get();
        momentum->set(math::Vector2f(
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

    std::shared_ptr<Entity> fireWeapon(entities::Entity* entity, std::chrono::microseconds elapsedTime)
    {
        auto position = entity->getComponent<components::Position>();
        auto momentum = entity->getComponent<components::Momentum>();

        auto missile = std::make_shared<entities::Entity>();
        missile->addComponent(std::make_unique<components::Appearance>("missile.png"));
        missile->addComponent(std::make_unique<components::Position>(position->get()));
        missile->addComponent(std::make_unique<components::Size>(math::Vector2f(0.005f, 0.005f)));
        missile->addComponent(std::make_unique<components::Lifetime>(std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::milliseconds(2000))));

        auto vectorX = std::cos(position->getOrientation() * DEGREES_TO_RADIANS);
        auto vectorY = std::sin(position->getOrientation() * DEGREES_TO_RADIANS);
        auto missileMomentum = math::Vector2f(momentum->get().x + vectorX * 0.0000003f, momentum->get().y + vectorY * 0.0000003f);
        missile->addComponent(std::make_unique<components::Momentum>(missileMomentum));
        missile->addComponent(std::make_unique<components::Weapon>(50.0f, entity->getId()));

        //
        // simulate the missle movement for the time already spent at the server so that it shows up
        // looking somewhat correct at the client
        drift(missile.get(), elapsedTime);

        return missile;
    }

    void drift(entities::Entity* entity, std::chrono::microseconds howLong)
    {
        auto position = entity->getComponent<components::Position>();
        auto momentum = entity->getComponent<components::Momentum>();

        auto current = position->get();
        position->set(math::Vector2f(
            current.x + momentum->get().x * howLong.count(),
            current.y + momentum->get().y * howLong.count()));
    }
} // namespace entities
