//------------------------------------------------------------------
//
// Creates a snow effect that lasts indefinitely.  There is no spec.
//
//------------------------------------------------------------------
Demo.components.ParticleSystem.createEffectSnow = function() {
    'use strict';
    let effect = {};
    let createSnowDelta = 5;    // Time between creating particles (in milliseconds)
    let lastSnowElapsed = createSnowDelta;    // How long since the last particle was created

    effect.update = function(elapsedTime) {
        lastSnowElapsed += elapsedTime;

        while (lastSnowElapsed >= createSnowDelta) {
            //
            // Create a new snowflake particle
            let size = Random.nextGaussian(0.008, 0.003);
            Demo.components.ParticleSystem.createParticle({
                image: Demo.assets['snowflake'],
                center: { x: Random.nextDouble(), y: 0 },
                sizeStart: size,
                sizeEnd: size,
                direction: { x: 0, y: 1 },
                speed: Math.max(Random.nextGaussian(0.0001, 0.00004), 0.00004),
                rateRotation: Random.nextRange(1, 2) === 1 ? Math.PI / 1000 : -Math.PI / 1000,    // Radians per millisecond
                lifetime: Random.nextGaussian(6000, 2000)
            });
            //
            // Subtract out the create particle delta so we still have any extra elapsed
            // time accounted for.
            lastSnowElapsed -= createSnowDelta;
        }

        //
        // This effect is active until manually terminated.
        return true;
    };

    return Demo.components.ParticleSystem.addEffect(effect);
};
