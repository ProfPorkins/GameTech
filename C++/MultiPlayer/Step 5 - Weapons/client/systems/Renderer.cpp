
#include "Renderer.hpp"

#include "entities/Entity.hpp"

#include <SFML/Graphics/RectangleShape.hpp>

namespace systems
{
    // --------------------------------------------------------------
    //
    // All rendering duties are handled here.  This includes rendering
    // the background of the play area and all other entities.
    //
    // Probably a terrible idea to hard-code the background rendering here,
    // I'll eventually find a better home for it.
    //
    // --------------------------------------------------------------
    void Renderer::update(std::chrono::microseconds elapsedTime, const std::chrono::system_clock::time_point now, std::shared_ptr<sf::RenderTarget> renderTarget)
    {
        (void)elapsedTime; // Ignore the compiler warning
        (void)now;

        // Draw the blue background
        sf::RectangleShape square({1.0f, 1.0f});
        square.setFillColor(sf::Color::Blue);
        square.setPosition({-0.5f, -0.5f});

        renderTarget->clear(sf::Color::Black);
        renderTarget->draw(square);

        // Render each of the entities
        for (auto&& [id, entity] : m_entities)
        {
            //
            // I know having these if statements isn't great for performance, but for this demo
            // code (for now), I'm okay with it.
            // Could bucket entities into Sprite and AnimatedSprite collections and render
            // them from those.
            auto position = entity->getComponent<components::Position>();
            if (entity->hasComponent<components::Sprite>())
            {
                auto sprite = entity->getComponent<components::Sprite>();
                sprite->get()->setPosition({position->get().x, position->get().y});
                sprite->get()->setRotation(position->getOrientation());

                renderTarget->draw(*sprite->get());
            }
            else if (entity->hasComponent<components::AnimatedSprite>())
            {
                auto sprite = entity->getComponent<components::AnimatedSprite>();
                sprite->update(elapsedTime);
                sprite->get()->setPosition({position->get().x, position->get().y});
                sprite->get()->setRotation(position->getOrientation());

                renderTarget->draw(*sprite->get());
            }
        }
    }

    // --------------------------------------------------------------
    //
    // This system can accept entities with either Sprite or AnimatedSprite
    // components.
    //
    // --------------------------------------------------------------
    bool Renderer::isInterested(entities::Entity* entity)
    {
        if (System::isInterested(entity))
        {
            if (entity->hasComponent<components::Sprite>() || entity->hasComponent<components::AnimatedSprite>())
            {
                return true;
            }
        }

        return false;
    }
} // namespace systems
