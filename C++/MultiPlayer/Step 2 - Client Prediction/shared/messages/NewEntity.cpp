#include "NewEntity.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // Use protobuffers to serialize to an std::string
    //
    // -----------------------------------------------------------------
    std::string NewEntity::serializeToString() const
    {
        return m_pbEntity.SerializeAsString();
    }

    // -----------------------------------------------------------------
    //
    // Parse the protobuffer object from an std::string
    //
    // -----------------------------------------------------------------
    bool NewEntity::parseFromString(const std::string& source)
    {
        return m_pbEntity.ParseFromString(source);
    }

} // namespace messages