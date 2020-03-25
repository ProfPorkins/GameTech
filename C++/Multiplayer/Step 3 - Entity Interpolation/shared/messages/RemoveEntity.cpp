#include "RemoveEntity.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // Use protobuffers to serialize to an std::string
    //
    // -----------------------------------------------------------------
    std::string RemoveEntity::serializeToString() const
    {
        shared::EntityId pbEntityId;

        pbEntityId.set_id(m_entityId);

        return pbEntityId.SerializeAsString();
    }

    // -----------------------------------------------------------------
    //
    // Parse the protobuffer object from an std::string
    //
    // -----------------------------------------------------------------
    bool RemoveEntity::parseFromString(const std::string& source)
    {
        return m_pbEntity.ParseFromString(source);
    }

} // namespace messages