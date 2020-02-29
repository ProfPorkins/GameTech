#include "KeyboardInput.hpp"

#include "MessageQueueClient.hpp"
#include "messages/Input.hpp"

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
    bool KeyboardInput::addEntity(std::shared_ptr<entities::Entity> entity)
    {
        // Need to let the System class do its thing
        if (!System::addEntity(entity))
            return false;
        //
        // Build a mapping from this entity's keyboard inputs to the functions this system
        // can invoke for those inputs.  This allows those functions to be directly
        // called when the keyboard inputs are seen.
        KeyToType map;
        for (auto&& input : entity->getComponent<components::Input>()->getInputs())
        {
            map.m_keyToType[m_typeToKeyMap[input]] = input;
        }
        // Add after creating the map, to ensure the copy into the m_keyToFunctionMap is correctly made
        // with all the keys to functions setup.
        m_keyToFunctionMap[entity->getId()] = map;

        return true;
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
        for (auto&& [id, entity] : m_entities)
        {
            std::vector<components::Input::Type> inputs;
            for (auto&& [key, keyEvent] : m_keysPressed)
            {
                if (m_keyToFunctionMap[id].m_keyToType.find(key) != m_keyToFunctionMap[id].m_keyToType.end())
                {
                    auto type = m_keyToFunctionMap[id].m_keyToType[key];
                    inputs.push_back(type);

                    // Client-side prediction of the input
                    m_predictionHandler(entity, type, elapsedTime);
                }
            }
            if (!inputs.empty())
            {
                MessageQueueClient::instance().sendMessageWithId(std::make_shared<messages::Input>(id, inputs, elapsedTime));
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
    void KeyboardInput::keyPressed(sf::Event::KeyEvent keyEvent, std::chrono::milliseconds elapsedTime)
    {
        (void)elapsedTime; // currently unused, will use it soon
        m_keysPressed[keyEvent.code] = keyEvent;
    }
    void KeyboardInput::keyReleased(sf::Event::KeyEvent keyEvent, std::chrono::milliseconds elapsedTime)
    {
        (void)elapsedTime; // currently unused, will use it soon
        m_keysPressed.erase(keyEvent.code);
    }

} // namespace systems
