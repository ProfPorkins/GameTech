#include "Utility.hpp"

#include "components/AnimatedAppearance.hpp"
#include "components/Appearance.hpp"
#include "components/Input.hpp"
#include "components/Lifetime.hpp"
#include "components/Momentum.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"

namespace messages
{
    // --------------------------------------------------------------
    //
    // Used to create a protobuf representation of an entity.
    //
    // --------------------------------------------------------------
    shared::Entity createPBEntity(const std::shared_ptr<entities::Entity>& entity)
    {
        shared::Entity pbEntity;

        pbEntity.set_id(entity->getId());

        if (entity->hasComponent<components::AnimatedAppearance>())
        {
            pbEntity.mutable_animatedappearance()->set_texture(entity->getComponent<components::AnimatedAppearance>()->getTexture());
            for (auto&& time : entity->getComponent<components::AnimatedAppearance>()->getSpriteTime())
            {
                pbEntity.mutable_animatedappearance()->add_spritetime(static_cast<std::uint32_t>(time.count()));
            }
        }

        if (entity->hasComponent<components::Appearance>())
        {
            pbEntity.mutable_appearance()->set_texture(entity->getComponent<components::Appearance>()->getTexture());
        }

        if (entity->hasComponent<components::Input>())
        {
            for (auto& [input, time] : entity->getComponent<components::Input>()->getInputs())
            {
                switch (input)
                {
                    case components::Input::Type::Thrust:
                        pbEntity.mutable_input()->add_type(shared::InputType::Thrust);
                        break;
                    case components::Input::Type::RotateLeft:
                        pbEntity.mutable_input()->add_type(shared::InputType::RotateLeft);
                        break;
                    case components::Input::Type::RotateRight:
                        pbEntity.mutable_input()->add_type(shared::InputType::RotateRight);
                        break;
                    case components::Input::Type::FireWeapon:
                        pbEntity.mutable_input()->add_type(shared::InputType::FireWeapon);
                        break;
                }
            }
        }

        if (entity->hasComponent<components::Position>())
        {
            auto position = entity->getComponent<components::Position>();
            pbEntity.mutable_position()->mutable_center()->set_x(position->get().x);
            pbEntity.mutable_position()->mutable_center()->set_y(position->get().y);
            pbEntity.mutable_position()->set_orientation(position->getOrientation());
        }

        if (entity->hasComponent<components::Size>())
        {
            pbEntity.mutable_size()->mutable_size()->set_x(entity->getComponent<components::Size>()->get().x);
            pbEntity.mutable_size()->mutable_size()->set_y(entity->getComponent<components::Size>()->get().y);
        }

        if (entity->hasComponent<components::Movement>())
        {
            pbEntity.mutable_movement()->set_thrustrate(entity->getComponent<components::Movement>()->getThrustRate());
            pbEntity.mutable_movement()->set_rotaterate(entity->getComponent<components::Movement>()->getRotateRate());
        }

        if (entity->hasComponent<components::Momentum>())
        {
            pbEntity.mutable_momentum()->mutable_momentum()->set_x(entity->getComponent<components::Momentum>()->get().x);
            pbEntity.mutable_momentum()->mutable_momentum()->set_y(entity->getComponent<components::Momentum>()->get().y);
        }

        if (entity->hasComponent<components::Lifetime>())
        {
            auto lifetime = entity->getComponent<components::Lifetime>();
            pbEntity.mutable_lifetime()->set_howlong(static_cast<std::uint32_t>(lifetime->get().count()));
        }

        return pbEntity;
    }

    // --------------------------------------------------------------
    //
    // Used to create a protobuf representation of an entity used for reporting
    // to "other" connected clients.
    //
    // --------------------------------------------------------------
    shared::Entity createReportablePBEntity(const std::shared_ptr<entities::Entity>& entity)
    {
        shared::Entity pbEntity;

        pbEntity.set_id(entity->getId());

        if (entity->hasComponent<components::Appearance>())
        {
            pbEntity.mutable_appearance()->set_texture(entity->getComponent<components::Appearance>()->getTexture());
        }

        if (entity->hasComponent<components::Position>())
        {
            auto position = entity->getComponent<components::Position>();
            pbEntity.mutable_position()->mutable_center()->set_x(position->get().x);
            pbEntity.mutable_position()->mutable_center()->set_y(position->get().y);
            pbEntity.mutable_position()->set_orientation(entity->getComponent<components::Position>()->getOrientation());
        }

        if (entity->hasComponent<components::Movement>())
        {
            auto movement = entity->getComponent<components::Movement>();
            pbEntity.mutable_movement()->set_thrustrate(movement->getThrustRate());
            pbEntity.mutable_movement()->set_rotaterate(movement->getRotateRate());
        }

        if (entity->hasComponent<components::Momentum>())
        {
            auto momentum = entity->getComponent<components::Momentum>();
            pbEntity.mutable_momentum()->mutable_momentum()->set_x(momentum->get().x);
            pbEntity.mutable_momentum()->mutable_momentum()->set_y(momentum->get().y);
        }

        if (entity->hasComponent<components::Size>())
        {
            pbEntity.mutable_size()->mutable_size()->set_x(entity->getComponent<components::Size>()->get().x);
            pbEntity.mutable_size()->mutable_size()->set_y(entity->getComponent<components::Size>()->get().y);
        }
        pbEntity.set_updatewindow(0);

        return pbEntity;
    }
} // namespace messages