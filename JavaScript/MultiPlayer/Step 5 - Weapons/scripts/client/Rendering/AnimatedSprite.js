// ------------------------------------------------------------------
//
// Rendering function for an /Components/AnimatedSprite object.
//
// ------------------------------------------------------------------
Demo.renderer.AnimatedSprite = (function(core) {
    'use strict';
    let that = {};

    that.render = function(sprite) {
        //
        // Pick the selected sprite from the sprite sheet to render
        core.drawImage(
            sprite.spriteSheet,
            sprite.pixelWidth * sprite.sprite, 0,    // Which sprite to pick out
            sprite.pixelWidth, sprite.pixelHeight,    // The size of the sprite in the sprite sheet
            sprite.center.x - sprite.width / 2,        // Where to draw the sprite
            sprite.center.y - sprite.height / 2,
            sprite.width, sprite.height);
    };

    return that;
}(Demo.renderer.core));
