#pragma once

#include "components/Input.hpp"
#include "entities/Entity.hpp"
#include "systems/System.hpp"

#include <SFML/Window/Event.hpp>
#include <SFML/Window/Keyboard.hpp>
#include <chrono>
#include <functional>
#include <initializer_list>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace systems
{
    // --------------------------------------------------------------
    //
    // This system handles the processing of keyboard events.
    //
    // --------------------------------------------------------------
    class KeyboardInput : public System
    {
      public:
        KeyboardInput(const std::initializer_list<std::tuple<components::Input::Type, sf::Keyboard::Key>>& mapping) :
            System({ctti::unnamed_type_id<components::Input>()})
        {
            for (auto&& input : mapping)
            {
                m_typeToKeyMap[std::get<0>(input)] = std::get<1>(input);
            }
        }

        virtual bool addEntity(std::shared_ptr<entities::Entity> entity) override;
        virtual void removeEntity(entities::Entity::IdType entityId) override;

        virtual void update(std::chrono::milliseconds elapsedTime) override;

        void keyPressed(sf::Event::KeyEvent keyEvent, std::chrono::milliseconds elapsedTime);
        void keyReleased(sf::Event::KeyEvent keyEvent, std::chrono::milliseconds elapsedTime);

      private:
        class KeyToType
        {
          public:
            std::unordered_map<sf::Keyboard::Key, components::Input::Type> m_keyToType;
        };

        std::unordered_map<sf::Keyboard::Key, sf::Event::KeyEvent> m_keysPressed;
        std::vector<components::Input::Type> m_inputEvents;

        std::unordered_map<components::Input::Type, sf::Keyboard::Key> m_typeToKeyMap;
        std::unordered_map<entities::Entity::IdType, KeyToType> m_keyToFunctionMap;
    };
} // namespace systems
