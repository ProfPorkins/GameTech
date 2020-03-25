#pragma once

#include "components/Position.hpp"
#include "components/Size.hpp"
#include "entities/Entity.hpp"
#include "systems/System.hpp"

#include <functional>
#include <memory>

namespace systems
{
    // --------------------------------------------------------------
    //
    // This system is used to detect when entities cause damage to
    // each other and report if one of them should be removed.
    //
    // --------------------------------------------------------------
    class Damage : public System
    {
      public:
        Damage() :
            System({ctti::unnamed_type_id<components::Position>(),
                    ctti::unnamed_type_id<components::Size>()})
        {
        }

        void registerRemoveEntityHandler(std::function<void(entities::Entity::IdType)> handler) { m_handlerRemoveEntity = handler; }
        virtual void removeEntity(entities::Entity::IdType entityId) override;
        virtual void update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now) override;

      protected:
        virtual bool isInterested(entities::Entity* entity) override;

      private:
        entities::EntitySet m_entitiesDamage;
        entities::EntitySet m_entitiesHealth;
        std::function<void(entities::Entity::IdType)> m_handlerRemoveEntity;

        bool collides(entities::Entity* e1, entities::Entity* e2);
        void notifyExplosion(math::Vector2f location);
    };
} // namespace systems
