#include "Movement.hpp"

#include "components/Goal.hpp"
#include "components/Input.hpp"
#include "entities/Player.hpp"
#include "misc/math.hpp"

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
    bool Movement::addEntity(std::shared_ptr<entities::Entity> entity)
    {
        bool interested = false;
        if (System::addEntity(entity))
        {
            interested = true;
            if (!entity->hasComponent<components::Input>())
            {
                auto position = entity->getComponent<components::Position>();
                entity->addComponent(std::make_unique<components::Goal>(position->get(), position->getOrientation()));
            }
        }

        return interested;
    }

    // --------------------------------------------------------------
    //
    // Update each entitiy's postion.  Some entities move based on a goal
    // provided by the server.  Some require entity (clien) prediction.
    //
    // --------------------------------------------------------------
    void Movement::update(std::chrono::microseconds elapsedTime)
    {
        for (auto&& [id, entity] : m_entities)
        {
            bool floating = true;
            auto floatingTime = elapsedTime;
            if (entity->hasComponent<components::Goal>())
            {
                auto goal = entity->getComponent<components::Goal>();
                //
                // Protect against divide by 0 in addition to checking for remaining update window time
                if (goal->getUpdateWindow().count() != 0 && goal->getUpdatedTime() < goal->getUpdateWindow())
                {
                    floating = false;
                    auto position = entity->getComponent<components::Position>();

                    // Don't want to interpolate longer than the update window
                    auto howMuch = elapsedTime;
                    if (goal->getUpdatedTime() + elapsedTime > goal->getUpdateWindow())
                    {
                        auto diff = (goal->getUpdatedTime() + elapsedTime) - goal->getUpdateWindow();
                        howMuch -= diff;
                        floating = true; // Need to float for the rest of the time
                        floatingTime = diff;
                    }

                    goal->setUpdatedTime(goal->getUpdatedTime() + howMuch);
                    auto updateFraction = static_cast<float>(howMuch.count()) / goal->getUpdateWindow().count();

                    //
                    // Turn first
                    position->setOrientation(position->getOrientation() - (goal->getStartOrientation() - goal->getGoalOrientation()) * updateFraction);
                    //
                    // Then move
                    position->set(
                        math::Vector2f(
                            position->get().x - (goal->getStartPosition().x - goal->getGoalPosition().x) * updateFraction,
                            position->get().y - (goal->getStartPosition().y - goal->getGoalPosition().y) * updateFraction));
                }
            }
            if (floating)
            {
                // Just floating along based on momentum
                auto position = entity->getComponent<components::Position>();
                if (position->getNeedsEntityPrediction())
                {
                    auto predictLength = std::chrono::duration_cast<std::chrono::microseconds>(position->getLastServerUpdate() - position->getLastClientUpdate());
                    entities::drift(entity.get(), predictLength);
                    position->resetEntityPrediction();
                }
                //else  // TODO: Still not sure if this should be an else
                {
                    entities::drift(entity.get(), floatingTime);
                    position->setLastClientUpdate();
                }
            }
        }
    } // namespace systems

} // namespace systems
