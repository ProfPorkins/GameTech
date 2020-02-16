#include "KeyboardInput.hpp"

#include "MessageQueueClient.hpp"
#include "entities/Entity.hpp"
#include "messages/Input.hpp"

#include <cmath>

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
                case components::Input::Type::Thrust:
                {
                    std::function<void(std::chrono::milliseconds)> f = std::bind(&KeyboardInput::thrust, this, std::placeholders::_1);
                    map.m_keyToFunction[m_typeToKeyMap[input]] = f;
                }
                break;
                case components::Input::Type::RotateLeft:
                {
                    std::function<void(std::chrono::milliseconds)> f = std::bind(&KeyboardInput::rotateLeft, this, std::placeholders::_1);
                    map.m_keyToFunction[m_typeToKeyMap[input]] = f;
                }
                break;
                case components::Input::Type::RotateRight:
                {
                    std::function<void(std::chrono::milliseconds)> f = std::bind(&KeyboardInput::rotateRight, this, std::placeholders::_1);
                    map.m_keyToFunction[m_typeToKeyMap[input]] = f;
                }
                break;
            }
        }
        // Add after creating the map, to ensure the copy into the m_keyToFunctionMap is correctly made
        // with all the keys to functions setup.
        m_keyToFunctionMap[entity->getId()] = map;
    }

    void KeyboardInput::removeEntity(entities::Entity::IdType entityId)
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
                    m_keyToFunctionMap[id].m_keyToFunction[key](elapsedTime);
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

    void KeyboardInput::thrust(std::chrono::milliseconds elapsedTime)
    {
        MessageQueueClient::instance().sendMessage(std::make_shared<messages::Input>(components::Input::Type::Thrust, elapsedTime));
    }

    void KeyboardInput::rotateLeft(std::chrono::milliseconds elapsedTime)
    {
        MessageQueueClient::instance().sendMessage(std::make_shared<messages::Input>(components::Input::Type::RotateLeft, elapsedTime));
    }

    void KeyboardInput::rotateRight(std::chrono::milliseconds elapsedTime)
    {
        MessageQueueClient::instance().sendMessage(std::make_shared<messages::Input>(components::Input::Type::RotateRight, elapsedTime));
    }
} // namespace systems
