#include "PlayerShip.hpp"

#include "components/Input.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Sprite.hpp"

namespace entities
{
    std::shared_ptr<Entity> createPlayerShip(std::string textureFile, sf::Vector2f viewSize, sf::Vector2f position, float size, std::unordered_set<std::shared_ptr<sf::Texture>>& textures)
    {
        std::shared_ptr<Entity> entity = std::make_shared<Entity>();

        //
        // Get the associated texture loaded first
        auto texture = std::make_shared<sf::Texture>();
        textures.insert(texture);
        if (!texture->loadFromFile(textureFile))
        {
            return nullptr;
        }

        auto spriteShip = std::make_shared<sf::Sprite>();
        spriteShip->setTexture(*texture);
        // This sets the point about which rotation takes place
        spriteShip->setOrigin({texture->getSize().x / 2.0f, texture->getSize().y / 2.0f});

        //
        // Original inspiration: https://en.sfml-dev.org/forums/index.php?topic=15755.0
        // Define a scaling that converts from the texture size in pixels to unit coordinates
        // that match the view.  This makes the texture have the same size/shape as the view.
        sf::Vector2f scaleToUnitSize(viewSize.x / texture->getSize().x, viewSize.y / texture->getSize().y);

        // Now, set the actual size of the ship based on the size passed in through the parameter
        spriteShip->setScale(size * scaleToUnitSize.x, size * scaleToUnitSize.y);

        //
        // A player ship has the following components
        entity->addComponent(std::make_unique<components::Position>(position));
        entity->addComponent(std::make_unique<components::Size>(viewSize));
        entity->addComponent(std::make_unique<components::Sprite>(spriteShip));
        entity->addComponent(std::make_unique<components::Movement>(0.0002f, 180.0f / 1000));

        auto inputs = {
            components::Input::Type::Forward,
            components::Input::Type::TurnLeft,
            components::Input::Type::TurnRight};
        entity->addComponent(std::make_unique<components::Input>(inputs));

        return entity;
    }
} // namespace entities
