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
                size: 0,
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
    //        image: ,                // Image to use for the particle
    //        center: { x: , y: },    // In world coordinates
    //        size: ,                    // In world coordinates
    //        direction: { x: , y: },    // 2D vector
    //        speed: ,                // World units per millisecond
    //        rateRotation: ,            // Radians per millisecond
    //        lifetime:                 // Milliseonds
    // }
    //
    //------------------------------------------------------------------
    that.createParticle = function(spec) {
        if (particleCount < MAX_PARTICLES) {
            let p = particlesCurrent[particleCount];
            particleCount += 1;

            p.image = spec.image;
            p.size = Math.max(0, spec.size);    // Ensure a valid size
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
    // This creates one new animated particle.  The spec is defined as:
    // {
    //        image: ,                // Image to use for the particle
    //        imageSize: ,            // Size of each tile
    //        imageTime: ,            // How long to display each tile, in milliseconds
    //        center: { x: , y: },    // In world coordinates
    //        size: ,                    // In world coordinates
    //        direction: { x: , y: },    // 2D vector
    //        speed: ,                // World units per millisecond
    //        rateRotation: ,            // Radians per millisecond
    //        lifetime:                 // Milliseonds
    // }
    //
    //------------------------------------------------------------------
    that.createAnimatedParticle = function(spec) {
        if (particleCount < MAX_PARTICLES) {
            let p = particlesCurrent[particleCount];
            particleCount += 1;

            p.image = spec.image;
            p.imageSize = spec.imageSize;
            p.imageCount = spec.image.width / spec.imageSize;
            p.imageCurrent = 0;
            p.imageTime = spec.imageTime;        // milliseconds per frame
            p.imageElapsedTime = 0;
            p.size = Math.max(0, spec.size);    // Ensure a valid size
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
            //
            // Update how long it has been alive
            particle.alive += elapsedTime;

            //
            // Update its position
            particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
            particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

            //
            // Update rotation - Yes, I know, redundant comment, but I can't help myself.
            particle.rotation += (particle.rateRotation * elapsedTime);

            //
            // Check if this is an animated particle, update accordingly
            if (particle.imageSize) {
                particle.imageElapsedTime += elapsedTime;
                while (particle.imageElapsedTime >= particle.imageTime) {
                    particle.imageElapsedTime -= particle.imageTime;
                    particle.imageCurrent += 1;
                    //
                    // If we've hit the end of the animation, then the particle must die
                    if (particle.imageCurrent >= particle.imageCount) {
                        particle.alive = particle.lifetime;
                    }
                }
            }

            //
            // Only keep particles whose lifetime is still active
            if (particle.alive < particle.lifetime) {
                let temp = keepMe[keepMePosition];
                keepMe[keepMePosition] = particlesCurrent[value];
                particlesCurrent[value] = temp;
                keepMePosition += 1;
            }
        }

        //
        // Point the particles reference to the correct particle buffer
        particlesCurrent = keepMe;
        particleCount = keepMePosition;
    };

    return that;
}());
