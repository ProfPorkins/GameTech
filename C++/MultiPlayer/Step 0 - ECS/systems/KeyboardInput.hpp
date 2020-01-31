#pragma once

#include "System.hpp"
#include "components/Input.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"

#include <SFML/Window/Keyboard.hpp>
#include <initializer_list>
#include <tuple>
#include <unordered_map>

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
        KeyboardInput(std::initializer_list<std::tuple<components::Input::Type, sf::Keyboard::Key>> mapping) :
            System({ctti::unnamed_type_id<components::Input>(),
                    ctti::unnamed_type_id<components::Position>(),
                    ctti::unnamed_type_id<components::Movement>()})
        {
            for (auto&& input : mapping)
            {
                m_inputMapping[std::get<0>(input)] = std::get<1>(input);
            }
        }

        virtual void update(std::chrono::milliseconds elapsedTime);

      private:
        std::unordered_map<components::Input::Type, sf::Keyboard::Key> m_inputMapping;

        void turnLeft(std::chrono::milliseconds elapsedTime, components::Position* position, components::Movement* movement);
        void turnRight(std::chrono::milliseconds elapsedTime, components::Position* position, components::Movement* movement);
        void moveForward(std::chrono::milliseconds elapsedTime, components::Position* position, components::Movement* movement);
    };
} // namespace systems
