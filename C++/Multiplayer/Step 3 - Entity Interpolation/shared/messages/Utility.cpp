#include "Utility.hpp"

#include "components/Appearance.hpp"
#include "components/Input.hpp"
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

        if (entity->hasComponent<components::Appearance>())
        {
            pbEntity.mutable_appearance()->set_texture(entity->getComponent<components::Appearance>()->get());
        }

        if (entity->hasComponent<components::Input>())
        {
            for (auto& input : entity->getComponent<components::Input>()->getInputs())
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
            auto movement = entity->getComponent<components::Movement>();
            pbEntity.mutable_movement()->set_moverate(movement->getMoveRate());
            pbEntity.mutable_movement()->set_rotaterate(movement->getRotateRate());
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
            pbEntity.mutable_appearance()->set_texture(entity->getComponent<components::Appearance>()->get());
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
            pbEntity.mutable_movement()->set_moverate(movement->getMoveRate());
            pbEntity.mutable_movement()->set_rotaterate(movement->getRotateRate());
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