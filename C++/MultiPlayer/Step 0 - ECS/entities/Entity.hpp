#pragma once

#include "components/Component.hpp"

#include <atomic>
#include <cstdint>
#include <ctti/type_id.hpp>
#include <memory>
#include <unordered_map>

namespace entities
{
    // --------------------------------------------------------------
    //
    // An Entity is an 'id' (a number) and a collection of components.
    //
    // The "name" for an entity is its "ctti::unnamed_type_id_t".  This
    // allows for compile-time determination of the name, using an integral
    // type, which also allows it to have fast lookup/use in various
    // associative containers.
    //
    // --------------------------------------------------------------
    class Entity
    {
      public:
        Entity() :
            m_id(Entity::nextId++)
        {
        }

        auto getId() { return m_id; }

        template <typename T>
        void addComponent(std::unique_ptr<T> component);

        template <typename T>
        void removeComponent();

        auto& getComponents() { return m_components; }

        template <typename T>
        T* getComponent();

      private:
        static std::atomic<std::uint32_t> nextId; // Each entity needs a unique id, using a static to do this.

        decltype(nextId.load()) m_id;
        std::unordered_map<ctti::unnamed_type_id_t, std::unique_ptr<components::Component>> m_components;
    };

    // Convenience type alias for use throughout the framework
    using EntityMap = std::unordered_map<decltype(Entity().getId()), std::shared_ptr<Entity>>;

    // --------------------------------------------------------------
    //
    // Components are stored by their compile-time unnamed_type_id, because
    // only one of each type can ever exist on an entity (famous last words!).
    //
    // --------------------------------------------------------------
    template <typename T>
    void Entity::addComponent(std::unique_ptr<T> component)
    {
        m_components[ctti::unnamed_type_id<T>()] = std::move(component);
    }

    // --------------------------------------------------------------
    //
    // The component type is no longer needed, so get rid of it!
    //
    // --------------------------------------------------------------
    template <typename T>
    void Entity::removeComponent()
    {
        m_components.erase(ctti::unnamed_type_id<T>());
    }

    // --------------------------------------------------------------
    //
    // This method is returning a raw pointer, because ownership is
    // not an issue.  The calling object can only use/mutate the state
    // of the component, not destroy it.
    //
    // --------------------------------------------------------------
    template <typename T>
    T* Entity::getComponent()
    {
        return static_cast<T*>(m_components[ctti::unnamed_type_id<T>()].get());
    }
} // namespace entities
