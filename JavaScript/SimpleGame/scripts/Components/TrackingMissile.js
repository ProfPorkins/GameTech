//------------------------------------------------------------------
//
// Defines a tracking missile fired from a base.  A missile contains a sprite.
// The spec is defined as:
//    {
//        center: { x: , y: }           // In world coordinates
//        target:                       // Entity to follow
//        momentum: { x: , y: }         // Direction of momentum
//        rotateRate:                   // Radians per second
//        lifetime:                     // How long (in milliseconds) the missle can live
//    }
//
//------------------------------------------------------------------
Demo.components.TrackingMissile = function(spec) {
    'use strict';

    //
    // A missile knows its own size
    spec.size = { width: 0.04, height: 0.01 };
    let that = Demo.components.Entity(spec, 'missile-2');

    Object.defineProperty(that, 'type', {
        get: function() { return Demo.components.Types.Missile; },
        enumerable: true,
        configurable: false
    });

    Object.defineProperty(that, 'orientation', {
        get: function() { return Math.atan2(spec.momentum.y, spec.momentum.x); },
        enumerable: true,
        configurable: false
    });

    Object.defineProperty(that, 'damage', {
        get: function() { return 1; },
        enumerable: true,
        configurable: false
    });

    spec.alive = 0;

    //------------------------------------------------------------------
    //
    // Update the position of the missile based on its current momentum vector,
    // then tell the underlying sprite model to also update.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        let keepAlive = false;

        spec.alive += elapsedTime;
        if (spec.alive < spec.lifetime) {
            let newOrientation = that.orientation;
            let angleToTarget = Demo.utilities.math.computeAngle(that.orientation, that.center, spec.target.center);
            if (Demo.utilities.math.testTolerance(angleToTarget.angle, 0, 0.01) === false) {
                if (angleToTarget.crossProduct > 0) {
                    if (angleToTarget.angle > (spec.rotateRate * elapsedTime)) {
                        newOrientation = that.orientation + (spec.rotateRate * elapsedTime);
                    } else {
                        newOrientation = that.orientation + angleToTarget.angle;
                    }
                } else {
                    if (angleToTarget.angle > (spec.rotateRate * elapsedTime)) {
                        newOrientation = that.orientation - (spec.rotateRate * elapsedTime);
                    } else {
                        newOrientation = that.orientation - angleToTarget.angle;
                    }
                }

                //
                // Convert the new orientation back into an updated momentum vector.  Have to
                // start by getting the current momentum vector magnitude, because the resulting
                // momentum vector needs to have the same magnitude.
                let magnitude = Math.sqrt(Math.pow(that.momentum.x, 2) + Math.pow(that.momentum.y, 2));
                spec.momentum.x = Math.cos(newOrientation);
                spec.momentum.y = Math.sin(newOrientation);
                let newMagnitude = Math.sqrt(Math.pow(that.momentum.x, 2) + Math.pow(that.momentum.y, 2));
                spec.momentum.x = (spec.momentum.x / newMagnitude) * magnitude;
                spec.momentum.y = (spec.momentum.y / newMagnitude) * magnitude;
            }

            that.sprite.center.x += (spec.momentum.x * elapsedTime);
            that.sprite.center.y += (spec.momentum.y * elapsedTime);

            that.sprite.update(elapsedTime);

            keepAlive = true;
        }

        return keepAlive;
    };

    //------------------------------------------------------------------
    //
    // Used to inform the missle that is collided with something at it's
    // current position.  We'll have it create a small particle explosion
    // when that happens.
    //
    //------------------------------------------------------------------
    that.collide = function(entity) {
        //
        // Only going to generate an effect if we hit another entity, there are
        // times when no entity was actually hit (like the border of the game world).
        if (entity) {
            Demo.components.ParticleSystem.createEffectExplosion({
                center: { x: that.sprite.center.x, y: that.sprite.center.y },
                howMany: 25
            });
        }

        return false;
    };

    //
    // Make a sound!
    Demo.assets['audio-base-missile'].currentTime = 0;
    Demo.assets['audio-base-missile'].play();

    return that;
};
