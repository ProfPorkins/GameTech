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
        shared::ClientId pbClientId;

        pbClientId.set_id(m_clientId);

        return pbClientId.SerializeAsString();
    }

    // -----------------------------------------------------------------
    //
    // Parse the protobuffer object from an std::string
    //
    // -----------------------------------------------------------------
    bool ConnectAck::parseFromString(const std::string& source)
    {
        return m_pbClientId.ParseFromString(source);
    }

} // namespace messages