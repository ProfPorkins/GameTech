//------------------------------------------------------------------
//
// Defines a Bird component.  A bird contains an animated sprite.
// The sprite is defined as:
//    {
//        size: { width: , height: },    // In world coordinates
//        center: { x: , y: }            // In world coordinates
//        rotation:                     // In Radians
//        moveRate:                     // World units per second
//        rotateRate:                    // Radians per second
//        animationScale:                // (optional) Scaling factor for the frame animation times
//    }
//
//------------------------------------------------------------------
Demo.components.Bird = function(spec) {
    'use strict';
    let sprite = null;
    let that = {
            get center() { return sprite.center; },
            get sprite() { return sprite; },
            get rotation() { return spec.rotation; }
        };

    //------------------------------------------------------------------
    //
    // The only update to do is to tell the underlying animated sprite
    // to update.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        sprite.update(elapsedTime, true);
    };

    //------------------------------------------------------------------
    //
    // Move in the direction the sprite is facing
    //
    //------------------------------------------------------------------
    that.moveForward = function(elapsedTime) {
        //
        // Create a normalized direction vector
        let vectorX = Math.cos(spec.rotation + spec.orientation);
        let vectorY = Math.sin(spec.rotation + spec.orientation);
        //
        // With the normalized direction vector, move the center of the sprite
        sprite.center.x += (vectorX * spec.moveRate * elapsedTime);
        sprite.center.y += (vectorY * spec.moveRate * elapsedTime);

        //
        // Don't allow the bird to get outside of the unit world.
        if (sprite.center.x > (1.0 - spec.size.width / 2)) {
            sprite.center.x = 1.0 - spec.size.width / 2;
        }
        if (sprite.center.x < spec.size.width / 2) {
            sprite.center.x = spec.size.width / 2;
        }
        if (sprite.center.y > (1.0 - spec.size.height / 2)) {
            sprite.center.y = 1.0 - spec.size.height / 2;
        }
        if (sprite.center.y < spec.size.height / 2) {
            sprite.center.y = spec.size.height / 2;
        }
    };

    //------------------------------------------------------------------
    //
    // Rotate the model to the right
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        spec.rotation += spec.rotateRate * (elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Rotate the model to the left
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        spec.rotation -= spec.rotateRate * (elapsedTime);
    };

    //
    // Get our animated bird model and renderer created
    sprite = Demo.components.AnimatedSprite({
        spriteSheet: Demo.assets['animated-bird'],
        spriteCount: 14,
        spriteTime: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
        animationScale: spec.animationScale,
        spriteSize: spec.size,            // Maintain the size on the sprite
        spriteCenter: spec.center        // Maintain the center on the sprite
    });

    spec.orientation = 0;

    return that;
};
