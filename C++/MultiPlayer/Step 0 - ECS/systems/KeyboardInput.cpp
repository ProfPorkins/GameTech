#include "KeyboardInput.hpp"

#include "entities/Entity.hpp"

#include <cmath>

namespace systems
{
    // --------------------------------------------------------------
    //
    // For each entity, check which inputs it has specified and
    // update based upon the current keyboard state.
    //
    // --------------------------------------------------------------
    void KeyboardInput::update(std::chrono::milliseconds elapsedTime)
    {
        for (auto&& [id, entity] : m_entities)
        {
            auto& inputs = entity->getComponent<components::Input>()->getInputs();
            auto position = entity->getComponent<components::Position>();
            auto movement = entity->getComponent<components::Movement>();

            //
            // Don't love the if statements here.  If systems held a list of relevant entities,
            // then a command pattern could be maintained for each, allowing the appropriate input
            // handler to be invoked directly.
            for (auto&& type : inputs)
            {
                if (sf::Keyboard::isKeyPressed(m_inputMapping[type]) && type == components::Input::Type::Forward)
                {
                    moveForward(elapsedTime, position, movement);
                }

                if (sf::Keyboard::isKeyPressed(m_inputMapping[type]) && type == components::Input::Type::TurnLeft)
                {
                    turnLeft(elapsedTime, position, movement);
                }

                if (sf::Keyboard::isKeyPressed(m_inputMapping[type]) && type == components::Input::Type::TurnRight)
                {
                    turnRight(elapsedTime, position, movement);
                }
            }
        }
    }

    void KeyboardInput::moveForward(std::chrono::milliseconds elapsedTime, components::Position* position, components::Movement* movement)
    {
        const float PI = 3.14159f;
        const float DEGREES_TO_RADIANS = PI / 180.0f;

        auto vectorX = std::cos(position->getOrientation() * DEGREES_TO_RADIANS);
        auto vectorY = std::sin(position->getOrientation() * DEGREES_TO_RADIANS);

        auto current = position->get();
        position->set(sf::Vector2f(
            current.x + vectorX * elapsedTime.count() * movement->getAcceleration(),
            current.y + vectorY * elapsedTime.count() * movement->getAcceleration()));
    }

    void KeyboardInput::turnLeft(std::chrono::milliseconds elapsedTime, components::Position* position, components::Movement* movement)
    {
        position->setOrientation(position->getOrientation() - movement->getRotateRate() * elapsedTime.count());
    }

    void KeyboardInput::turnRight(std::chrono::milliseconds elapsedTime, components::Position* position, components::Movement* movement)
    {
        position->setOrientation(position->getOrientation() + movement->getRotateRate() * elapsedTime.count());
    }
} // namespace systems
