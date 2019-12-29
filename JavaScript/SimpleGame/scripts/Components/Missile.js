//------------------------------------------------------------------
//
// Defines a missile fired from the player's ship.  A missile contains a sprite.
// The spec is defined as:
//    {
//        center: { x: , y: }          // In world coordinates
//        momentum: { x: , y: }        // Direction of momentum
//        lifetime:                    // How long (in milliseconds) the missle can live
//    }
//
//------------------------------------------------------------------
Demo.components.Missile = function(spec) {
    'use strict';
    //
    // A missile knows its own size
    spec.size = { width: 0.03, height: 0.008 };
    let that = Demo.components.Entity(spec, 'missile-1');

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
        spec.alive += elapsedTime;
        if (spec.alive < spec.lifetime) {
            that.sprite.center.x += (spec.momentum.x * elapsedTime);
            that.sprite.center.y += (spec.momentum.y * elapsedTime);

            that.sprite.update(elapsedTime);

            return true;
        }

        return false;
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
            // Make a sound!
            Demo.assets['audio-missile-hit'].currentTime = 0;
            Demo.assets['audio-missile-hit'].play();
        }

        return false;
    };

    //
    // Make a sound!
    Demo.assets['audio-spaceship-missile'].currentTime = 0;
    Demo.assets['audio-spaceship-missile'].play();

    return that;
};
