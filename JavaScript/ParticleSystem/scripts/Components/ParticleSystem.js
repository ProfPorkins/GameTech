// ------------------------------------------------------------------
//
// This namespace holds the particle system component.
//
// ------------------------------------------------------------------
Demo.components.ParticleSystem = (function() {
    'use strict';
    let effects = {};    // Set of active effects
    let nextEmitterId = 0;    // Provides unique names for emitters
    const MAX_PARTICLES = 5000;
    let particlesStorage1 = preAllocateParticleArray(MAX_PARTICLES);
    let particlesStorage2 = preAllocateParticleArray(MAX_PARTICLES);
    let particlesCurrent = particlesStorage1;
    let particleCount = 0;
    let that = {
            get particles() { return particlesCurrent; },
            get particleCount() { return particleCount; }
        };

    //------------------------------------------------------------------
    //
    // Pre-allocate the particle buffer arrays.  We want to reuse memory and no
    // be allocating lot's of stuff all the time.
    //
    //------------------------------------------------------------------
    function preAllocateParticleArray(howMany) {
        let particles = new Array(howMany);

        for (let particle = 0; particle < howMany; particle += 1) {
            particles[particle] = {
                image: null,
                alphaStart: 1.0,
                alphaEnd: 1.0,
                alpha: 1.0,     // The current alpha blending value for the particle
                sizeStart: 0,
                sizeEnd: 0,
                size: 0,    // The current size of the particle
                center: { x: 0, y: 0 },
                direction: { x: 0, y: 0 },
                speed: 0,
                rateRotation: 0,
                rotation: 0,
                lifetime: 0,
                alive: 0
            };
        }

        return particles;
    }

    //------------------------------------------------------------------
    //
    // This creates one new particle.  The spec is defined as:
    // {
    //      image: ,                    // Image to use for the particle
    //      alphaStart: ,               // (optional) Starting value for alpha blending
    //      alphaEnd: ,                 // (optional) Ending value for alpha blending
    //      center: { x: , y: },        // In world coordinates
    //      sizeStart: ,                // Size of the particle at the start of its life (world coordinates)
    //      sizeEnd: ,                  // Size of the particle at the end of its life (world coordinates)
    //      direction: { x: , y: },     // 2D vector
    //      speed: ,                    // World units per millisecond
    //      rateRotation: ,             // Radians per millisecond
    //      lifetime:                   // Milliseonds
    // }
    //
    //------------------------------------------------------------------
    that.createParticle = function(spec) {
        if (particleCount < MAX_PARTICLES) {
            let p = particlesCurrent[particleCount];
            particleCount += 1;

            p.image = spec.image;
            if (spec.alphaStart != undefined && spec.alphaEnd != undefined) {
                p.alphaStart = spec.alphaStart;
                p.alphaEnd = spec.alphaEnd;
            } else {
                p.alphaStart = 1.0;
                p.alphaEnd = 1.0;
            }
            p.sizeStart = Math.max(0, spec.sizeStart);  // Ensure a valid size
            p.sizeEnd = Math.max(0, spec.sizeEnd);      // Ensure a valid size
            p.size = p.sizeStart;
            p.center.x = spec.center.x;
            p.center.y = spec.center.y;
            p.direction.x = spec.direction.x;
            p.direction.y = spec.direction.y;
            p.speed = spec.speed;
            p.rateRotation = spec.rateRotation;
            p.rotation = 0;
            p.lifetime = Math.max(0.01, spec.lifetime);    // Ensure a valid lifetime
            p.alive = 0;
        }
    };

    //------------------------------------------------------------------
    //
    // Allow an effect to be added to the current set of effects.  'effect'
    // must expose an 'update' function according to:
    //
    //    effect.update = function(elapsedTime) { return true/false; }
    //
    // The function returns true if it should continue, false if it should be terminated.
    //
    //------------------------------------------------------------------
    that.addEffect = function(effect) {
        effects[nextEmitterId] = effect;
        nextEmitterId += 1;

        return nextEmitterId - 1;
    };

    //------------------------------------------------------------------
    //
    // Allows an active effect to be removed.
    //
    //------------------------------------------------------------------
    that.terminateEffect = function(effectId) {
        if (effects.hasOwnProperty(effectId)) {
            delete effects[effectId];
        }
    };

    //------------------------------------------------------------------
    //
    // Update the state of all particles.  This includes removing any that
    // have exceeded their lifetime or have move outside of the unit world.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        let keepMe = (particlesCurrent === particlesStorage1) ? particlesStorage2 : particlesStorage1;
        let keepMePosition = 0;

        //
        // First step, update all the active effects
        for (let effect in effects) {
            if (effects.hasOwnProperty(effect)) {
                if (effects[effect].update(elapsedTime) === false) {
                    delete effects[effect];
                }
            }
        }

        //
        // Next step, update all the particles
        for (let value = 0; value < particleCount; value += 1) {
            let particle = particlesCurrent[value];

            particle.alive += elapsedTime;

            particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
            particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

            //
            // Only keep particles whose lifetime is still active and is inside
            // of the unit world.
            if (particle.alive < particle.lifetime) {
                if (particle.center.x >= 0 && particle.center.x <= 1 && particle.center.y >= 0 && particle.center.y <= 1) {
                    // Waiting to update rotation and size until after we know the particle
                    // is going to be kept...small optimization.

                    particle.rotation += (particle.rateRotation * elapsedTime);

                    let scale = particle.alive / particle.lifetime;
                    let sizeDiff = particle.sizeStart - particle.sizeEnd;
                    particle.size = particle.sizeStart - (scale * sizeDiff);

                    let alphaDiff = particle.alphaStart - particle.alphaEnd;
                    particle.alpha = particle.alphaStart - (scale * alphaDiff);

                    let temp = keepMe[keepMePosition];
                    keepMe[keepMePosition] = particlesCurrent[value];
                    particlesCurrent[value] = temp;
                    keepMePosition += 1;
                }
            }
        }

        //
        // Point the particles reference to the correct particle buffer
        particlesCurrent = keepMe;
        particleCount = keepMePosition;
    };

    return that;
}());
