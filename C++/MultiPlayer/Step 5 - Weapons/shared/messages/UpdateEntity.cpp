#include "UpdateEntity.hpp"

#include "components/Momentum.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // Use protobuffers to serialize to an std::string
    //
    // -----------------------------------------------------------------
    std::string UpdateEntity::serializeToString() const
    {
        shared::Entity pbEntity;

        pbEntity.mutable_messageid()->set_id(m_messageId.value());

        pbEntity.set_id(m_entity->getId());

        if (m_entity->hasComponent<components::Position>())
        {
            auto position = m_entity->getComponent<components::Position>();
            pbEntity.mutable_position()->mutable_center()->set_x(position->get().x);
            pbEntity.mutable_position()->mutable_center()->set_y(position->get().y);
            pbEntity.mutable_position()->set_orientation(m_entity->getComponent<components::Position>()->getOrientation());
        }

        if (m_entity->hasComponent<components::Momentum>())
        {
            auto momentum = m_entity->getComponent<components::Momentum>();
            pbEntity.mutable_momentum()->mutable_momentum()->set_x(momentum->get().x);
            pbEntity.mutable_momentum()->mutable_momentum()->set_y(momentum->get().y);
        }

        pbEntity.set_updatewindow(static_cast<std::uint32_t>(m_updateWindow.count()));

        return pbEntity.SerializeAsString();
    }

    // -----------------------------------------------------------------
    //
    // Parse the protobuffer object from an std::string
    //
    // -----------------------------------------------------------------
    bool UpdateEntity::parseFromString(const std::string& source)
    {
        auto success = m_pbEntity.ParseFromString(source);
        m_messageId = m_pbEntity.messageid().id();
        return success;
    }

} // namespace messages