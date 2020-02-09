#include "ConnectSelf.hpp"

#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"

namespace messages
{
    std::string ConnectSelf::serializeToString() const
    {
        shared::Player pbPlayer;

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

    bool ConnectSelf::parseFromString(const std::string& source)
    {
        return m_pbPlayer.ParseFromString(source);
    }

} // namespace messages