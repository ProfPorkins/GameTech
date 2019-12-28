//------------------------------------------------------------------
//
// Defines a SpaceShip component.  A Spaceship contains a sprite.
// The spec is defined as:
//    {
//        size: { width: , height: },    // In world coordinates
//        center: { x: , y: }            // In world coordinates
//        rotation:                     // In Radians
//        moveRate:                     // World units per second
//        rotateRate:                    // Radians per second
//    }
//
//------------------------------------------------------------------
Demo.components.SpaceShip = function(spec) {
    'use strict';
    let sprite = null;
    let that = {
            get center() { return sprite.center; },
            get sprite() { return sprite; },
            get rotation() { return spec.rotation; },
            get orientation() { return spec.orientation; },
            get moveRate() { return spec.moveRate; },
        };

    //------------------------------------------------------------------
    //
    // The only thing to do is to tell the underlying sprite to update.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        sprite.update(elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Propose where the ship would move in the direction the sprite is facing.
    //
    //------------------------------------------------------------------
    that.proposedMove = function(elapsedTime) {
        //
        // Create a normalized direction vector
        let vectorX = Math.cos(spec.rotation + spec.orientation);
        let vectorY = Math.sin(spec.rotation + spec.orientation);
        let center = {
                x: sprite.center.x + (vectorX * spec.moveRate * elapsedTime),
                y: sprite.center.y + (vectorY * spec.moveRate * elapsedTime),
            };

        return center;
    }

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
    // Get our sprite model
    sprite = Demo.components.Sprite({
        image: Demo.assets['spaceship'],
        spriteSize: spec.size,            // Maintain the size on the sprite
        spriteCenter: spec.center        // Maintain the center on the sprite
    });

    spec.orientation = 0;

    return that;
};
