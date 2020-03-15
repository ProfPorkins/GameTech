#pragma once

#include "components/Component.hpp"
#include "entities/Entity.hpp"

// --------------------------------------------------------------
//
// Specifies the amount of damage the weapon causes.
//
// --------------------------------------------------------------
namespace components
{
    class Weapon : public Component
    {
      public:
        Weapon(float damage, entities::Entity::IdType ownerId) :
            m_damage(damage),
            m_ownerId(ownerId)
        {
        }

        auto getDamage() { return m_damage; }
        auto getOwnerId() { return m_ownerId; }

      private:
        float m_damage;
        entities::Entity::IdType m_ownerId;
    };
} // namespace components
