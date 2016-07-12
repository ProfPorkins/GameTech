/* global Demo  */

// ------------------------------------------------------------------
//
// This namespace holds the particle system component.
//
// ------------------------------------------------------------------
Demo.components.ParticleSystem = (function() {
	'use strict';
	var emitters = [],	// Set of active effects
		nextName = 1,	// unique identifier for the next particle
		particles = {},	// Set of all active particles
		that = {
			get particles() { return particles; },
			get emitters() { return emitters; }
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
	that.createParticle = function(spec) {
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
		for (effect in emitters) {
			if (emitters.hasOwnProperty(effect)) {
				if (emitters[effect].update(elapsedTime) === true) {
					keepMe.push(emitters[effect]);
				}
			}
		}

		//
		// Re-assign the active effects array
		emitters = keepMe;

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
}());
