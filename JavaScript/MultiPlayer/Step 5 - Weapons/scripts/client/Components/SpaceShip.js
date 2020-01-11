//------------------------------------------------------------------
//
// Defines a SpaceShip component.  A Spaceship contains a sprite.
// The spec is defined as:
//  {
//      image: ,                        // image to use for rendering
//      size: { width: , height: },     // In world coordinates
//      center: { x: , y: }             // In world coordinates
//      momentum: { x: , y: }           // In world coordinates
//      direction:                      // In Radians,
//      rotateRate:                     // Radians per millisecond
//      thrustRate:                     // World units per millisecond
//  }
//
//------------------------------------------------------------------
Demo.components.SpaceShip = function(spec) {
    'use strict';
    let that = {};

    //
    // Get our sprite model
    let sprite = Demo.components.Sprite({
        image: spec.image,
        spriteSize: spec.size,          // Maintain the size on the sprite
        spriteCenter: spec.center       // Maintain the center on the sprite
    });

    Object.defineProperty(that, 'momentum', {
        get: () => spec.momentum
    });

    Object.defineProperty(that, 'direction', {
        get: () => spec.direction,
        set: (value) => { spec.direction = value; }
    });

    Object.defineProperty(that, 'rotateRate', {
        get: () => spec.rotateRate,
        set: value => { spec.rotateRate = value; }
    });

    Object.defineProperty(that, 'thrustRate', {
        get: () => spec.thrustRate,
        set: value => { spec.thrustRate = value; }
    });

    Object.defineProperty(that, 'center', {
        get: () => sprite.center
    });

    Object.defineProperty(that, 'size', {
        get: () => spec.size
    });

    Object.defineProperty(that, 'sprite', {
        get: () => sprite
    });

    //------------------------------------------------------------------
    //
    // Public function that applies thrust in the current direction.
    //
    //------------------------------------------------------------------
    that.thrust = function(elapsedTime) {
        let vectorX = Math.cos(spec.direction);
        let vectorY = Math.sin(spec.direction);

        spec.momentum.x += (vectorX * spec.thrustRate * elapsedTime);
        spec.momentum.y += (vectorY * spec.thrustRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player right.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        spec.direction += (spec.rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player left.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        spec.direction -= (spec.rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // The client-side update for a SpaceShip accounts for its momentum,
    // anticipating it before receiving confirmation from the server.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        spec.center.x += (spec.momentum.x * elapsedTime);
        spec.center.y += (spec.momentum.y * elapsedTime);
    };

    return that;
};
