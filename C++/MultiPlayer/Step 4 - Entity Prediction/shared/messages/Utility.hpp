#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#pragma warning(push)
#pragma warning(disable : 4127)
#include "Entity.pb.h"
#pragma warning(pop)

#include "entities/Entity.hpp"

#include <memory>

namespace messages
{
    shared::Entity createPBEntity(const std::shared_ptr<entities::Entity>& entity);
    shared::Entity createReportablePBEntity(const std::shared_ptr<entities::Entity>& entity);
} // namespace messages
