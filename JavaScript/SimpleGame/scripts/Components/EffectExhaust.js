//------------------------------------------------------------------
//
// Creates an exhaust effect used by the SpaceShip when accelerating.
// The spec is defined as:
// {
//        center: { x: , y: },
//        momentum: { x: , y: },    // Momentum to add to the particles
//        direction: ,            // direction (radians) to emite the particles
//        spread: ,                // Arc (radians) to spread the particles over
//        howMany:                 // How many particles to emit
// }
//
//------------------------------------------------------------------
Demo.components.ParticleSystem.createEffectExhaust = function(spec) {
    'use strict';
    let effect = { };
    let addSpeed = Math.sqrt(Math.pow(spec.momentum.x, 2) + Math.pow(spec.momentum.y, 2));

    effect.update = function() {
        for (let particle = 0; particle < spec.howMany; particle += 1) {
            //
            // Create a new fire particle
            let angle = spec.direction - (spec.spread / 2) + Random.nextDouble() * spec.spread;
            Demo.components.ParticleSystem.createAnimatedParticle({
                image: Demo.assets['particle-fire'],
                center: { x: spec.center.x, y: spec.center.y },
                size: Random.nextGaussian(0.010, 0.004),
                direction: { x: Math.cos(angle), y: Math.sin(angle) },
                speed: addSpeed + Random.nextGaussian(0.0003, 0.0001),
                rateRotation: (2 * Math.PI) / 1000,    // Radians per millisecond
                lifetime: Random.nextGaussian(350, 50)
            });
        }

        return false;    // One time emit!
    };

    return Demo.components.ParticleSystem.addEffect(effect);
};
