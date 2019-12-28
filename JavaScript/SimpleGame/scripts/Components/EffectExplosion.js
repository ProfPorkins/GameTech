//------------------------------------------------------------------
//
// Creates an explostion effect that emits all particles at creation time.
// The spec is defined as:
// {
//        center: { x: , y: },
//        howMany: // How many particles to emit
// }
//
//------------------------------------------------------------------
Demo.components.ParticleSystem.createEffectExplosion = function(spec) {
    'use strict';
    let effect = { };

    effect.update = function() {
        for (let particle = 0; particle < spec.howMany; particle += 1) {
            //
            // Create a new fire particle
            Demo.components.ParticleSystem.createAnimatedParticle({
                image: Demo.assets['particle-fireball'],
                imageSize: 256,
                imageTime: 40,
                center: { x: spec.center.x, y: spec.center.y },
                size: Random.nextGaussian(0.025, 0.008),
                direction: Random.nextCircleVector(),
                speed: Random.nextGaussian(0.0002, 0.00005),
                rateRotation: 0,    // Radians per millisecond
                lifetime: Random.nextGaussian(1000, 250)
            });
        }

        return false;    // One time emit!
    };

    return Demo.components.ParticleSystem.addEffect(effect);
};
