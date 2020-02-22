#include "Player.hpp"

#include "components/Appearance.hpp"
#include "components/Input.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"

namespace entities
{
    std::shared_ptr<Entity> createPlayer(std::string texture, sf::Vector2f position, float size, float speed, float rotateRate)
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
} // namespace entities
