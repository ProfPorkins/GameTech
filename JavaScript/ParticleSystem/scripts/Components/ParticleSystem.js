/* global Demo, Random */

// ------------------------------------------------------------------
//
// This namespace holds the particle system component.
//
// ------------------------------------------------------------------
Demo.components.ParticleSystem = (function(assets) {
	'use strict';
	var effects = [],	// Set of active effects
		nextName = 1,	// unique identifier for the next particle
		particles = {},	// Set of all active particles
		that = {
			get particles() { return particles; }
		};

	//------------------------------------------------------------------
	//
	// This creates one new particle.  The spec is defined as:
	// {
	//		image: ,				// Image to use for the particle
	//		center: { x: , y: },	// In world coordinates
	//		size: ,					// In world coordinates
	//		direction: { x: , y: },	// 2D vector
	//		speed: ,				// World units per millisecond
	//		rateRotation: ,			// Radians per millisecond
	//		lifetime: 				// Milliseonds
	// }
	//
	//------------------------------------------------------------------
	function createParticle(spec) {
		//
		// Have to add these into the particle.
		spec.rotation = 0;
		spec.alive = 0;		// How long the particle has been alive

		//
		// Ensure we have a valid size
		spec.size = Math.max(0, spec.size);
		//
		// Same thing with lifetime
		spec.lifetime = Math.max(0.01, spec.lifetime);
		//
		// Assign a unique name to each particle
		particles[nextName] = spec;
		nextName += 1;
	}

	//------------------------------------------------------------------
	//
	// Creates an explostion effect; all particles are emitted at one time.
	// The spec is defined as:
	// {
	//		center: { x: , y: },
	//		howMany: Number of particles to emit
	// }
	//
	//------------------------------------------------------------------
	that.createEffectExplosion = function(spec) {
		var effect = {
				get center() { return spec.center; },
				get emitRate() { return 0; }
			},
			particle = 0;

		effect.update = function() {
			for (particle = 0; particle < spec.howMany; particle += 1) {
				//
				// Create a new fire particle
				createParticle({
					image: assets['fire'],
					center: { x: spec.center.x, y: spec.center.y },
					size: Random.nextGaussian(0.015, 0.005),
					direction: Random.nextCircleVector(),
					speed: Random.nextGaussian(0.0003, 0.0001),
					rateRotation: (2 * Math.PI) / 1000,	// Radians per millisecond
					lifetime: Random.nextGaussian(1500, 250)
				});
			}

			return false;	// One time emit!
		};

		effects.push(effect);
	};

	//------------------------------------------------------------------
	//
	// Creates a fire effect that burns for a specified amount of time.
	// The spec is defined as:
	// {
	//		center: { x: , y: },
	//		lifetime: how long the effect should last (in milliseconds)
	// }
	//
	//------------------------------------------------------------------
	that.createEffectFire = function(spec) {
		var effect = {
				get center() { return spec.center; },
				get emitRate() { return spec.emitRate; }
			},
			createFireDelta = 10,	// Time between creating particles (in milliseconds)
			lastFireElapsed = createFireDelta,	// How long since the last particle was created
			createSmokeDelta = 20,
			lastSmokeElapsed = createSmokeDelta,
			lived = 0;	// How long the effect has been alive

		effect.update = function(elapsedTime) {
			lived += elapsedTime;
			lastFireElapsed += elapsedTime;
			lastSmokeElapsed += elapsedTime;

			while (lastFireElapsed >= createFireDelta) {
				//
				// Create a new fire particle
				createParticle({
					image: assets['fire'],
					center: { x: spec.center.x, y: spec.center.y },
					size: Random.nextGaussian(0.015, 0.005),
					direction: Random.nextCircleVector(),
					speed: Random.nextGaussian(0.0001, 0.00005),
					rateRotation: (2 * Math.PI) / 1000,	// Radians per millisecond
					lifetime: Random.nextGaussian(4000, 1000)
				});
				//
				// Subtract out the create particle delta so we still have any extra elapsed
				// time accounted for.
				lastFireElapsed -= createFireDelta;
			}

			while (lastSmokeElapsed >= createSmokeDelta) {
				//
				// Create a new fire particle
				createParticle({
					image: assets['smoke'],
					center: { x: spec.center.x, y: spec.center.y },
					size: Random.nextGaussian(0.02, 0.005),
					direction: Random.nextCircleVector(),
					speed: Random.nextGaussian(0.0001, 0.00005),
					rateRotation: (2 * Math.PI) / 1000,	// Radians per millisecond
					lifetime: Random.nextGaussian(4000, 1000)
				});
				//
				// Subtract out the create particle delta so we still have any extra elapsed
				// time accounted for.
				lastSmokeElapsed -= createSmokeDelta;
			}

			//
			// Return true if the effect is still emmitting particles, false otherwise
			return lived < spec.lifetime;
		};

		effects.push(effect);
	};

	//------------------------------------------------------------------
	//
	// Update the state of all particles.  This includes removing any that
	// have exceeded their lifetime.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		var removeMe = [],
			keepMe = [],
			value = 0,
			particle = null,
			effect = 0;

		//
		// First step, update all the active effects
		for (effect in effects) {
			if (effects.hasOwnProperty(effect)) {
				if (effects[effect].update(elapsedTime) === true) {
					keepMe.push(effects[effect]);
				}
			}
		}

		//
		// Re-assign the active effects array
		effects = keepMe;

		for (value in particles) {
			if (particles.hasOwnProperty(value)) {
				particle = particles[value];
				//
				// Update how long it has been alive
				particle.alive += elapsedTime;

				//
				// Update its position
				particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
				particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

				//
				// Update rotation
				particle.rotation += (particle.rateRotation * elapsedTime);

				//
				// If the lifetime has expired, identify it for removal
				if (particle.alive > particle.lifetime) {
					removeMe.push(value);
				}
				//
				// If the particle goes outside the unit world, kill it.
				if (particle.center.x < 0 || particle.center.x > 1 || particle.center.y < 0 || particle.center.y > 1) {
					removeMe.push(value);
				}
			}
		}

		//
		// Remove all of the expired particles
		for (particle = 0; particle < removeMe.length; particle += 1) {
			delete particles[removeMe[particle]];
		}
		removeMe.length = 0;
	};

	return that;
}(Demo.assets));
