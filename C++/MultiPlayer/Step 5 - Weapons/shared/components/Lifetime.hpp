#pragma once

#include "components/Component.hpp"

#include <chrono>

// --------------------------------------------------------------
//
// Specifies the how long the entity should live.
//
// --------------------------------------------------------------
namespace components
{
    class Lifetime : public Component
    {
      public:
        Lifetime(std::chrono::microseconds howLong) :
            m_howLong(howLong)
        {
        }

        auto get() { return m_howLong; }
        void update(std::chrono::microseconds howMuch) { m_howLong -= howMuch; }

      private:
        std::chrono::microseconds m_howLong;
    };
} // namespace components
