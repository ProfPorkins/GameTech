//------------------------------------------------------------------
//
// Defines a SpaceShip component.  A Spaceship contains a sprite.
// The spec is defined as:
//    {
//        size: { width: , height: },    // In world coordinates
//        center: { x: , y: }            // In world coordinates
//        target: { x: , y: }            // Location to move to
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
            get rotation() { return spec.rotation; }
        };

    //------------------------------------------------------------------
    //
    // Returns the magnitude of the 2D cross product.  The sign of the
    // magnitude tells you which direction to rotate to close the angle
    // between the two vectors.
    //
    //------------------------------------------------------------------
    function crossProduct2d(v1, v2) {
        return (v1.x * v2.y) - (v1.y * v2.x);
    }

    //------------------------------------------------------------------
    //
    // Computes the angle, and direction (cross product) between two vectors.
    //
    //------------------------------------------------------------------
    function computeAngle(rotation, ptCenter, ptTarget) {
        let v1 = {
                x : Math.cos(rotation),
                y : Math.sin(rotation)
            };
        let v2 = {
                x : ptTarget.x - ptCenter.x,
                y : ptTarget.y - ptCenter.y
            };

        v2.len = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        v2.x /= v2.len;
        v2.y /= v2.len;

        let dp = v1.x * v2.x + v1.y * v2.y;
        let angle = Math.acos(dp);
        //
        // It is possible to get a NaN result, when that happens, set the angle to
        // 0 so that any use of it doesn't have to check for NaN.
        if (isNaN(angle)) {
            angle = 0;
        }

        //
        // Get the cross product of the two vectors so we can know
        // which direction to rotate.
        let cp = crossProduct2d(v1, v2);

        return {
            angle : angle,
            crossProduct : cp
        };
    }

    //------------------------------------------------------------------
    //
    // Simple helper function to help testing a value with some level of tolerance.
    //
    //------------------------------------------------------------------
    function testTolerance(value, test, tolerance) {
        if (Math.abs(value - test) < tolerance) {
            return true;
        }

        return false;
    }

    //------------------------------------------------------------------
    //
    // The only update to do is to tell the underlying sprite to update.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        //
        // Check to see if the spaceship is pointing at the target or not.
        let result = computeAngle(spec.rotation, spec.center, spec.target);
        if (testTolerance(result.angle, 0, 0.01) === false) {
            if (result.crossProduct > 0) {
                if (result.angle > (spec.rotateRate * elapsedTime)) {
                    spec.rotation += (spec.rotateRate * elapsedTime);
                } else {
                    spec.rotation += result.angle;
                }
            } else {
                if (result.angle > (spec.rotateRate * elapsedTime)) {
                    spec.rotation -= (spec.rotateRate * elapsedTime);
                } else {
                    spec.rotation -= result.angle;
                }
            }
        }

        //
        // See if we need to move
        let distance = Math.sqrt(Math.pow(spec.center.x - spec.target.x, 2) + Math.pow(spec.center.y - spec.target.y, 2));
        if (testTolerance(distance, 0, 0.005) === false) {
            that.moveForward(elapsedTime);
        }

        sprite.update(elapsedTime);
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
        // Don't allow the spaceship to get outside of the unit world.
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
    // Point we want the spaceship to turn towards.
    //
    //------------------------------------------------------------------
    that.setTarget = function(target) {
        spec.target = {
            x : target.x,
            y : target.y
        };
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
