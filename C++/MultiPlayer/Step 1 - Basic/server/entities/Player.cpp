#include "Player.hpp"

#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Input.hpp"
#include "components/Size.hpp"

namespace entities
{
    std::shared_ptr<Entity> createPlayer(sf::Vector2f position, float size, float speed, float rotateRate)
    {
        std::shared_ptr<Entity> entity = std::make_shared<Entity>();

        //
        // A player ship has the following components
        entity->addComponent(std::make_unique<components::Position>(position));
        entity->addComponent(std::make_unique<components::Size>(sf::Vector2f(size, size)));
        entity->addComponent(std::make_unique<components::Movement>(speed, rotateRate));

        auto inputs = {
            components::Input::Type::Forward,
            components::Input::Type::TurnLeft,
            components::Input::Type::TurnRight};
        entity->addComponent(std::make_unique<components::Input>(inputs));

        return entity;
    }
} // namespace entities
