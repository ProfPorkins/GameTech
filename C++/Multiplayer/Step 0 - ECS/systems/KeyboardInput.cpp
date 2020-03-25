#include "KeyboardInput.hpp"

#include "entities/Entity.hpp"

#include <cmath>
#include <iostream>

namespace systems
{
    // --------------------------------------------------------------
    //
    // When an entity is added to this system, a mapping from its logical
    // inputs directly to the methods that perform those actions is
    // created.  This allows the update method to iterative through only
    // those keys that are currently pressed and directly invoke the
    // entity methods (if they exist).
    //
    // --------------------------------------------------------------
    void KeyboardInput::addEntity(std::shared_ptr<entities::Entity> entity)
    {
        // Need to let the System class do its thing
        System::addEntity(entity);
        //
        // Build a mapping from this entity's keyboard inputs to the functions this system
        // can invoke for those inputs.  This allows those functions to be directly
        // called when the keyboard inputs are seen.
        KeyToFunction map;
        for (auto&& input : entity->getComponent<components::Input>()->getInputs())
        {
            switch (input)
            {
                case components::Input::Type::Forward:
                {
                    std::function<void(std::chrono::milliseconds, components::Position*, components::Movement*)> f = std::bind(&KeyboardInput::moveForward, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3);
                    map.m_keyToFunction[m_typeToKeyMap[input]] = f;
                }
                break;
                case components::Input::Type::TurnLeft:
                {
                    std::function<void(std::chrono::milliseconds, components::Position*, components::Movement*)> f = std::bind(&KeyboardInput::turnLeft, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3);
                    map.m_keyToFunction[m_typeToKeyMap[input]] = f;
                }
                break;
                case components::Input::Type::TurnRight:
                {
                    std::function<void(std::chrono::milliseconds, components::Position*, components::Movement*)> f = std::bind(&KeyboardInput::turnRight, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3);
                    map.m_keyToFunction[m_typeToKeyMap[input]] = f;
                }
                break;
            }
        }
        // Add after creating the map, to ensure the copy into the m_keyToFunctionMap is correctly made
        // with all the keys to functions setup.
        m_keyToFunctionMap[entity->getId()] = map;
    }

    void KeyboardInput::removeEntity(decltype(entities::Entity().getId()) entityId)
    {
        // Need to let the System class do its thing
        System::removeEntity(entityId);
        // Remove from out local key to function mapping
        m_keyToFunctionMap.erase(entityId);
    }

    // --------------------------------------------------------------
    //
    // For each entity, check which inputs it has specified and
    // update based upon the current keyboard state.
    //
    // --------------------------------------------------------------
    void KeyboardInput::update(std::chrono::milliseconds elapsedTime)
    {
        for (auto&& [key, keyEvent] : m_keysPressed)
        {
            for (auto&& [id, entity] : m_entities)
            {
                if (m_keyToFunctionMap[id].m_keyToFunction.find(key) != m_keyToFunctionMap[id].m_keyToFunction.end())
                {
                    auto position = entity->getComponent<components::Position>();
                    auto movement = entity->getComponent<components::Movement>();
                    m_keyToFunctionMap[id].m_keyToFunction[key](elapsedTime, position, movement);
                }
            }
        }
    }

    // --------------------------------------------------------------
    //
    // These two methods are used to track which keys are currently
    // pressed.  The reason for doing this is to hopefully making it
    // more efficient to process only the keyboard input events that
    // are active, instead of looping through all possible keyboard
    // keys and asking if they are pressed.
    //
    // --------------------------------------------------------------
    void KeyboardInput::keyPressed(sf::Event::KeyEvent keyEvent)
    {
        m_keysPressed[keyEvent.code] = keyEvent;
    }
    void KeyboardInput::keyReleased(sf::Event::KeyEvent keyEvent)
    {
        m_keysPressed.erase(keyEvent.code);
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
