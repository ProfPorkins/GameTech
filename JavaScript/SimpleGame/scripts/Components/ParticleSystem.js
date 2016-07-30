/* global Demo  */

// ------------------------------------------------------------------
//
// This namespace holds the particle system component.
//
// ------------------------------------------------------------------
Demo.components.ParticleSystem = (function() {
	'use strict';
	var effects = {},	// Set of active effects
		nextEmitterId = 0,	// Provides unique names for emitters
		MAX_PARTICLES = 5000,
		particlesStorage1 = preAllocateParticleArray(MAX_PARTICLES),
		particlesStorage2 = preAllocateParticleArray(MAX_PARTICLES),
		particlesCurrent = particlesStorage1,
		particleCount = 0,
		that = {
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
		var particles = new Array(howMany),
			particle = 0;

		for (particle = 0; particle < howMany; particle += 1) {
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
		if (particleCount < MAX_PARTICLES) {
			var p = particlesCurrent[particleCount];
			particleCount += 1;

			p.image = spec.image;
			p.size = Math.max(0, spec.size);	// Ensure a valid size
			p.center.x = spec.center.x;
			p.center.y = spec.center.y;
			p.direction.x = spec.direction.x;
			p.direction.y = spec.direction.y;
			p.speed = spec.speed;
			p.rateRotation = spec.rateRotation;
			p.rotation = 0;
			p.lifetime = Math.max(0.01, spec.lifetime);	// Ensure a valid lifetime
			p.alive = 0;
		}
	};

	//------------------------------------------------------------------
	//
	// Allow an effect to be added to the current set of effects.  'effect'
	// must expose an 'update' function according to:
	//
	//	effect.update = function(elapsedTime) { return true/false; }
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
		var keepMe = (particlesCurrent === particlesStorage1) ? particlesStorage2 : particlesStorage1,
			keepMePosition = 0,
			value = 0,
			particle = null,
			temp = null,
			effect = 0;

		//
		// First step, update all the active effects
		for (effect in effects) {
			if (effects.hasOwnProperty(effect)) {
				if (effects[effect].update(elapsedTime) === false) {
					delete effects[effect];
				}
			}
		}

		//
		// Next step, update all the particles
		for (value = 0; value < particleCount; value += 1) {
			particle = particlesCurrent[value];
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
			// Only keep particles whose lifetime is still active and is inside
			// of the unit world.
			if (particle.alive < particle.lifetime) {
				if (particle.center.x >= 0 && particle.center.x <= 1 && particle.center.y >= 0 && particle.center.y <= 1) {
					temp = keepMe[keepMePosition];
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
