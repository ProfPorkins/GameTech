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
    std::shared_ptr<Entity> create(std::string texture, sf::Vector2f position, float size, float speed, float rotateRate)
    {
        std::shared_ptr<Entity> entity = std::make_shared<Entity>();

        entity->addComponent(std::make_unique<components::Appearance>(texture));

        //
        // A player ship has the following components
        entity->addComponent(std::make_unique<components::Position>(position));
        entity->addComponent(std::make_unique<components::Size>(sf::Vector2f(size, size)));
        entity->addComponent(std::make_unique<components::Movement>(speed, rotateRate));

        auto inputs = {
            components::Input::Type::Thrust,
            components::Input::Type::RotateLeft,
            components::Input::Type::RotateRight};
        entity->addComponent(std::make_unique<components::Input>(inputs));

        return entity;
    }

    // --------------------------------------------------------------
    //
    // The following functions are shared between the client and server,
    // they are used to handle input on the player entity for either
    // server or client simulation.
    //
    // --------------------------------------------------------------
    void thrust(std::shared_ptr<entities::Entity>& entity, std::chrono::milliseconds elapsedTime)
    {
        const float PI = 3.14159f;
        const float DEGREES_TO_RADIANS = PI / 180.0f;

        auto position = entity->getComponent<components::Position>();
        auto movement = entity->getComponent<components::Movement>();

        auto vectorX = std::cos(position->getOrientation() * DEGREES_TO_RADIANS);
        auto vectorY = std::sin(position->getOrientation() * DEGREES_TO_RADIANS);

        auto current = position->get();
        position->set(sf::Vector2f(
            current.x + vectorX * elapsedTime.count() * movement->getMoveRate(),
            current.y + vectorY * elapsedTime.count() * movement->getMoveRate()));
    }

    void rotateLeft(std::shared_ptr<entities::Entity>& entity, std::chrono::milliseconds elapsedTime)
    {
        auto position = entity->getComponent<components::Position>();
        auto movement = entity->getComponent<components::Movement>();

        position->setOrientation(position->getOrientation() - movement->getRotateRate() * elapsedTime.count());
    }

    void rotateRight(std::shared_ptr<entities::Entity>& entity, std::chrono::milliseconds elapsedTime)
    {
        auto position = entity->getComponent<components::Position>();
        auto movement = entity->getComponent<components::Movement>();

        position->setOrientation(position->getOrientation() + movement->getRotateRate() * elapsedTime.count());
    }
} // namespace entities::player
