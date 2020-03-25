#include "Interpolation.hpp"

#include "components/Goal.hpp"
#include "components/Input.hpp"

#include <SFML/System/Vector2.hpp>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Interested in entities that have both Movement and Position components,
    // but not if they have an Input component.  Furthermore, this
    // system adds an Goal component in order to properly update the
    // entity's state during the update stage.
    //
    // --------------------------------------------------------------
    bool Interpolation::addEntity(std::shared_ptr<entities::Entity> entity)
    {
        bool interested = false;
        if (!entity->hasComponent<components::Input>())
        {
            if (System::addEntity(entity))
            {
                interested = true;
                auto position = entity->getComponent<components::Position>();
                entity->addComponent(std::make_unique<components::Goal>(position->get(), position->getOrientation()));
            }
        }

        return interested;
    }

    // --------------------------------------------------------------
    //
    // Move each entity close to its goal.
    //
    // --------------------------------------------------------------
    void Interpolation::update(std::chrono::milliseconds elapsedTime)
    {
        for (auto&& [id, entity] : m_entities)
        {
            auto position = entity->getComponent<components::Position>();
            auto goal = entity->getComponent<components::Goal>();

            //
            // Make sure we have something to do, and also protect against divide by 0
            if (goal->getUpdateWindow().count() > 0 && goal->getUpdatedTime() < goal->getUpdateWindow())
            {
                goal->setUpdatedTime(goal->getUpdatedTime() + elapsedTime);
                auto updateFraction = static_cast<float>(elapsedTime.count()) / goal->getUpdateWindow().count();

                //
                // Turn first
                position->setOrientation(position->getOrientation() - (goal->getStartOrientation() - goal->getGoalOrientation()) * updateFraction);
                //
                // Then move
                position->set(
                    sf::Vector2f(
                        position->get().x - (goal->getStartPosition().x - goal->getGoalPosition().x) * updateFraction,
                        position->get().y - (goal->getStartPosition().y - goal->getGoalPosition().y) * updateFraction));
            }
        }
    }

} // namespace systems
