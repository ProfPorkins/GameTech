#include "NotifyJoinSelf.hpp"

#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // Use protobuffers to serialize to an std::string
    //
    // -----------------------------------------------------------------
    std::string NotifyJoinSelf::serializeToString() const
    {
        shared::Entity pbPlayer;

        pbPlayer.set_id(m_player->getId());

        auto position = m_player->getComponent<components::Position>();
        pbPlayer.mutable_position()->mutable_center()->set_x(position->get().x);
        pbPlayer.mutable_position()->mutable_center()->set_x(position->get().y);
        pbPlayer.mutable_position()->set_orientation(m_player->getComponent<components::Position>()->getOrientation());

        pbPlayer.mutable_size()->mutable_size()->set_x(m_player->getComponent<components::Size>()->get().x);
        pbPlayer.mutable_size()->mutable_size()->set_y(m_player->getComponent<components::Size>()->get().y);

        pbPlayer.mutable_movement()->set_moverate(m_player->getComponent<components::Movement>()->getMoveRate());
        pbPlayer.mutable_movement()->set_rotaterate(m_player->getComponent<components::Movement>()->getRotateRate());

        return pbPlayer.SerializeAsString();
    }

    // -----------------------------------------------------------------
    //
    // Parse the protobuffer object from an std::string
    //
    // -----------------------------------------------------------------
    bool NotifyJoinSelf::parseFromString(const std::string& source)
    {
        return m_pbPlayer.ParseFromString(source);
    }

} // namespace messages