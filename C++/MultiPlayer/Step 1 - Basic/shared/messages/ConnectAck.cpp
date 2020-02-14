#include "ConnectAck.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // Use protobuffers to serialize to an std::string
    //
    // -----------------------------------------------------------------
    std::string ConnectAck::serializeToString() const
    {
        shared::PlayerId pbPlayerId;

        pbPlayerId.set_id(m_playerId);

        return pbPlayerId.SerializeAsString();
    }

    // -----------------------------------------------------------------
    //
    // Parse the protobuffer object from an std::string
    //
    // -----------------------------------------------------------------
    bool ConnectAck::parseFromString(const std::string& source)
    {
        return m_pbPlayerId.ParseFromString(source);
    }

} // namespace messages