#pragma once

//
// Disable some compiler warnings that come from google protocol buffers
#if defined(_MSC_VER)
    #pragma warning(push)
    #pragma warning(disable : 4127)
#endif
#include "Entity.pb.h"
#if defined(_MSC_VER)
    #pragma warning(pop)
#endif

#include "entities/Entity.hpp"

#include <memory>

namespace messages
{
    shared::Entity createPBEntity(const std::shared_ptr<entities::Entity>& entity);
    shared::Entity createReportablePBEntity(const std::shared_ptr<entities::Entity>& entity);
} // namespace messages
