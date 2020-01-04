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
            let sizeStart = Random.nextGaussian(0.015, 0.005);
            let sizeEnd = sizeStart * 0.2;
            Demo.components.ParticleSystem.createParticle({
                image: Demo.assets['fire'],
                alphaStart: 1.0,
                alphaEnd: 0.2,
                center: { x: spec.center.x, y: spec.center.y },
                sizeStart: sizeStart,
                sizeEnd: sizeEnd,
                direction: Random.nextCircleVector(1.0),
                speed: Random.nextGaussian(0.0003, 0.0001),
                rateRotation: (2 * Math.PI) / 1000,    // Radians per millisecond
                lifetime: Random.nextGaussian(1500, 250)
            });
        }

        return false;    // One time emit!
    };

    return Demo.components.ParticleSystem.addEffect(effect);
};
