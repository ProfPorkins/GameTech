#include "Input.hpp"

namespace messages
{
    // -----------------------------------------------------------------
    //
    // Use protobuffers to serialize to an std::string
    //
    // -----------------------------------------------------------------
    std::string Input::serializeToString() const
    {
        shared::Input pbInput;

        switch (m_type)
        {
            case components::Input::Type::Thrust:
                pbInput.set_type(shared::InputType::Thrust);
                break;
            case components::Input::Type::RotateLeft:
                pbInput.set_type(shared::InputType::RotateLeft);
                break;
            case components::Input::Type::RotateRight:
                pbInput.set_type(shared::InputType::RotateRight);
                break;
        }
        pbInput.set_elapsedtime(static_cast<std::uint32_t>(m_elapsedTime.count()));

        return pbInput.SerializeAsString();
    }

    // -----------------------------------------------------------------
    //
    // Parse the protobuffer object from an std::string
    //
    // -----------------------------------------------------------------
    bool Input::parseFromString(const std::string& source)
    {
        return m_pbInput.ParseFromString(source);
    }

} // namespace messages