#pragma once

#include "entities/Entity.hpp"

#include <chrono>
#include <ctti/type_id.hpp>
#include <initializer_list>
#include <unordered_set>

// --------------------------------------------------------------
//
// A system is where all logic associated with the game is handled.
// Each system is specialized to operate over a particular set of
// entities, handling things like movement, collision detection,
// and rendering.
//
// --------------------------------------------------------------
class System
{
  public:
    System(std::initializer_list<ctti::unnamed_type_id_t> list) :
        m_interests(list)
    {
    }

    // The (void)elapsedTime is a technique to silence an unused parameter warning
    virtual void update(std::chrono::milliseconds elapsedTime) { (void)elapsedTime; }
    bool isInterested(Entity* entity);

  private:
    std::unordered_set<ctti::unnamed_type_id_t> m_interests;
};
