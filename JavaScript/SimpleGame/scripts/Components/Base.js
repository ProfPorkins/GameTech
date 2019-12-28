//------------------------------------------------------------------
//
// Defines a Base component.  A Base contains a sprite.
// The spec is defined as:
//    {
//        imageName:                    // Asset name to use for the base
//        center: { x: , y: }            // In world coordinates
//        radius:                     // In world coordinates
//        rotation:                     // In Radians
//        rotateRate:                    // Radians per second
//        vicinity:                    // In world coordinates
//        missile: {
//            delay:                    // How long (milliseconds) between firing missiles
//            lifetime:                // How long (milliseconds) a missle lives
//            rotateRate:                // How fast (radians/millisecond) a missile can turn
//        hitPoints: {
//            max:                    // Maximum hit points for the base
//        },
//        shield: {
//            regenerationDelay:        // How long (milliseconds) between shield regeneration
//            thickness:                // In world coordinates
//            max:                    // Maximum value for the shield, also the starting strength
//        }
//    }
//
//------------------------------------------------------------------
Demo.components.Base = function(spec) {
    'use strict';
    let sprite = null;
    let shield = {
            get radius() { return spec.radius + spec.shield.thickness; },
            get strength() { return spec.shield.strength; },
            get max() { return spec.shield.max; }
        };
    let that = {
            get type() { return Demo.components.Types.Base; },
            get center() { return sprite.center; },
            get radius() { return spec.radius; },
            get rotation() { return spec.rotation; },
            get hitPoints() { return spec.hitPoints; },
            get shield() { return shield; },
            get sprite() { return sprite; },
        };
    let boundingCircle = {
            get center() { return that.center; },
            get radius() { return that.radius; }
        };
    let regenerationTime = 0;
    let lastMissileFired = 0;

    Object.defineProperty(that, 'boundingCircle', {
        get: function() { return boundingCircle; },
        enumerable: true,
        configurable: false
    });

    //------------------------------------------------------------------
    //
    // Tell the sprite to update and continue to rotate the base.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        sprite.update(elapsedTime);
        spec.rotation += (spec.rotateRate * elapsedTime);

        //
        // Shields regenerate every 1 second
        regenerationTime += elapsedTime;
        if (regenerationTime >= spec.shield.regenerationDelay) {
            spec.shield.strength = Math.min(spec.shield.strength + 1, spec.shield.max);
            regenerationTime -= spec.shield.regenerationDelay;
        }

        //
        // Update how long since last missle was fired
        lastMissileFired += elapsedTime;

        return true;
    };

    //------------------------------------------------------------------
    //
    // Check to see if the Base collides with another entity.
    //
    //------------------------------------------------------------------
    that.intersects = function(entity) {
        return Demo.utilities.math.circleCircleIntersect(entity.boundingCircle, that.boundingCircle);
    }

    //------------------------------------------------------------------
    //
    // Called when another entity gets within the 'vicinity' of this entity.
    //
    //------------------------------------------------------------------
    that.vicinity = function(entity, report) {
        //
        // If the other entity is a spaceship and is within our vicinity, then
        // fire a missle if we haven't fired one in the last X milliseconds.
        if (entity.type === Demo.components.Types.SpaceShip) {
            let distance = Math.sqrt(Math.pow(entity.center.x - that.center.x, 2) + Math.pow(entity.center.y - that.center.y, 2));
            if (distance <= spec.vicinity && lastMissileFired > spec.missile.delay) {
                lastMissileFired = 0;
                let direction = {
                    x: entity.center.x - that.center.x,
                    y: entity.center.y - that.center.y
                };
                let magnitude = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2));

                direction.x = (direction.x / magnitude) / 4000;
                direction.y = (direction.y / magnitude) / 4000;

                let missile = Demo.components.TrackingMissile({
                    center : { x: that.center.x, y: that.center.y },
                    target: entity,
                    momentum: { x: direction.x, y: direction.y },
                    rotateRate: spec.missile.rotateRate,
                    lifetime: spec.missile.lifetime
                });

                //
                // Report the firing of the missle back to the calling code.
                report(missile, Demo.renderer.Missile);
                //
                // Make a sound!
                Demo.assets['audio-base-missile'].currentTime = 0;
                Demo.assets['audio-base-missile'].play();
            }
        }
    };

    //------------------------------------------------------------------
    //
    // Handle the collision behavior for when the Base collides with another entity.
    //
    //------------------------------------------------------------------
    that.collide = function(entity) {
        let keepAlive = true;
        let damageLeft = entity.damage;

        if (that.shield.strength > 0) {
            spec.shield.strength -= damageLeft;
            if (spec.shield.strength < 0) {
                damageLeft = Math.abs(spec.shield.strength);
                spec.shield.strength = 0;
            }
        }
        if (spec.shield.strength === 0 && damageLeft > 0) {
            spec.hitPoints.strength = Math.max(spec.hitPoints.strength - damageLeft, 0);
            if (spec.hitPoints.strength <= 0) {
                keepAlive = false;
                //
                // Make a nice big explosion when this happens!
                Demo.components.ParticleSystem.createEffectExplosion({
                    center: { x: that.center.x, y: that.center.y },
                    howMany: 1000
                });
                //
                // Make a sound!
                Demo.assets['audio-base-explosion'].currentTime = 0.5;    // Start it a little into the effect because there is a dead spot at the start of it
                Demo.assets['audio-base-explosion'].play();
            }
        }
        //
        // No matter what happens, reset the next shield regeneration time.
        regenerationTime = 0;

        return keepAlive;
    };

    //
    // Set the initial shield and base strengths
    spec.hitPoints.strength = spec.hitPoints.max;
    spec.shield.strength = spec.shield.max;

    //
    // Get our sprite model
    sprite = Demo.components.Sprite({
        image: Demo.assets[spec.imageName],
        spriteSize: { width: spec.radius * 2, height: spec.radius * 2 },    // Maintain the size on the sprite
        spriteCenter: spec.center    // Maintain the center on the sprite
    });

    return that;
};
