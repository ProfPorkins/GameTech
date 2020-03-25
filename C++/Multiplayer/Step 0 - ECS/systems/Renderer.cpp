
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
    void Renderer::update(std::chrono::milliseconds elapsedTime, std::shared_ptr<sf::RenderTarget> renderTarget)
    {
        (void)elapsedTime; // Ignore the compiler warning

        // Draw the blue background
        sf::RectangleShape square({1.0f, 1.0f});
        square.setFillColor(sf::Color::Blue);
        square.setPosition({-0.5f, -0.5f});

        renderTarget->clear(sf::Color::Black);
        renderTarget->draw(square);

        // Render each of the entities
        for (auto&& [id, entity] : m_entities)
        {
            auto position = entity->getComponent<components::Position>();
            auto ship = entity->getComponent<components::Sprite>();

            ship->get()->setPosition(position->get());
            ship->get()->setRotation(position->getOrientation());

            renderTarget->draw(*ship->get());
        }
    }
} // namespace systems
