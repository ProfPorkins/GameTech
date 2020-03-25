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

        pbInput.mutable_messageid()->set_id(m_messageId.value());

        pbInput.set_entityid(m_entityId);
        for (auto input : m_inputs)
        {
            switch (input)
            {
                case components::Input::Type::Thrust:
                {
                    auto pair = pbInput.add_input();
                    pair->set_type(shared::InputType::Thrust);
                    pair->set_elapsedtime(static_cast<std::uint32_t>(m_elapsedTime.count()));
                }
                break;
                case components::Input::Type::RotateLeft:
                {
                    auto pair = pbInput.add_input();
                    pair->set_type(shared::InputType::RotateLeft);
                    pair->set_elapsedtime(static_cast<std::uint32_t>(m_elapsedTime.count()));
                }
                break;
                case components::Input::Type::RotateRight:
                {
                    auto pair = pbInput.add_input();
                    pair->set_type(shared::InputType::RotateRight);
                    pair->set_elapsedtime(static_cast<std::uint32_t>(m_elapsedTime.count()));
                }
                break;
                case components::Input::Type::FireWeapon:
                {
                    auto pair = pbInput.add_input();
                    pair->set_type(shared::InputType::FireWeapon);
                    pair->set_elapsedtime(0); // time doesn't matter
                }
                break;
            }
        }

        return pbInput.SerializeAsString();
    }

    // -----------------------------------------------------------------
    //
    // Parse the protobuffer object from an std::string
    //
    // -----------------------------------------------------------------
    bool Input::parseFromString(const std::string& source)
    {
        auto success = m_pbInput.ParseFromString(source);
        m_messageId = m_pbInput.messageid().id();
        return success;
    }

} // namespace messages