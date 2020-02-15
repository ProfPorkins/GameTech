#include "PlayerShip.hpp"

#include "components/Input.hpp"
#include "components/Movement.hpp"
#include "components/Position.hpp"
#include "components/Size.hpp"
#include "components/Sprite.hpp"

namespace entities
{
    // --------------------------------------------------------------
    //
    // Creates the 'self' player based on a protobuf object.
    //
    // --------------------------------------------------------------
    std::shared_ptr<Entity> createPlayerSelf(const shared::Entity& pbPlayer, sf::Vector2f viewSize, std::unordered_set<std::shared_ptr<sf::Texture>>& textures)
    {
        // Server provided the entity id, so use it
        std::shared_ptr<Entity> entity = std::make_shared<Entity>(pbPlayer.id());

        //
        // Get the associated texture loaded first
        auto texture = std::make_shared<sf::Texture>();
        textures.insert(texture);
        if (!texture->loadFromFile("assets/playerShip1_blue.png"))
        {
            return nullptr;
        }

        auto spriteShip = std::make_shared<sf::Sprite>();
        spriteShip->setTexture(*texture);
        // This sets the point about which rotation takes place - center of the sprite/texture
        spriteShip->setOrigin({texture->getSize().x / 2.0f, texture->getSize().y / 2.0f});

        //
        // Original inspiration: https://en.sfml-dev.org/forums/index.php?topic=15755.0
        // Define a scaling that converts from the texture size in pixels to unit coordinates
        // that match the view.  This makes the texture have the same size/shape as the view.
        sf::Vector2f scaleToUnitSize(viewSize.x / texture->getSize().x, viewSize.y / texture->getSize().y);

        // Now, set the actual size of the ship based on the size passed in through the parameter
        spriteShip->setScale(pbPlayer.size().size().x() * scaleToUnitSize.x, pbPlayer.size().size().x() * scaleToUnitSize.y);

        //
        // A player ship has the following components
        entity->addComponent(std::make_unique<components::Position>(
            sf::Vector2f(pbPlayer.position().center().x(), pbPlayer.position().center().y()),
            pbPlayer.position().orientation()));
        entity->addComponent(std::make_unique<components::Size>(viewSize));
        entity->addComponent(std::make_unique<components::Sprite>(spriteShip));
        entity->addComponent(std::make_unique<components::Movement>(pbPlayer.movement().moverate(), pbPlayer.movement().rotaterate()));

        auto inputs = {
            components::Input::Type::Thrust,
            components::Input::Type::RotateLeft,
            components::Input::Type::RotateRight};
        entity->addComponent(std::make_unique<components::Input>(inputs));

        return entity;
    }
} // namespace entities
