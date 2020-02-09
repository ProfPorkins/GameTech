#include "ConnectSelf.hpp"

#include "Player.pb.h"
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
        shared::Player pbPlayer;

        if (pbPlayer.ParseFromString(source))
        {
            auto c = pbPlayer.position().center();
            auto s = pbPlayer.size().size();
            auto o = pbPlayer.position().orientation();
            auto mr = pbPlayer.movement().moverate();
            auto rr = pbPlayer.movement().rotaterate();
            return true;
        }

        return false;
    }

} // namespace messages