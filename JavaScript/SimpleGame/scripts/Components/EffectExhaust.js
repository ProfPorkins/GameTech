/* global Demo, Random */

//------------------------------------------------------------------
//
// Creates an exhaust effect used by the SpaceShip when accelerating.
// The spec is defined as:
// {
//		center: { x: , y: },
//		direction: ,	// direction (radians) to emite the particles
//		spread: ,		// Arc (radians) to spread the particles over
//		howMany: // How many particles to emit
// }
//
//------------------------------------------------------------------
Demo.components.ParticleSystem.createEffectExhaust = function(spec) {
	'use strict';
	var effect = { },
		particle = 0,
		angle;

	effect.update = function() {
		for (particle = 0; particle < spec.howMany; particle += 1) {
			//
			// Create a new fire particle
			angle = spec.direction - (spec.spread / 2) + Random.nextDouble() * spec.spread;
			Demo.components.ParticleSystem.createParticle({
				image: Demo.assets['particle-star'],
				center: { x: spec.center.x, y: spec.center.y },
				size: Random.nextGaussian(0.006, 0.003),
				direction: { x: Math.cos(angle), y: Math.sin(angle) },
				speed: Random.nextGaussian(0.0003, 0.0001),
				rateRotation: (2 * Math.PI) / 1000,	// Radians per millisecond
				lifetime: Random.nextGaussian(350, 50)
			});
		}

		return false;	// One time emit!
	};

	return Demo.components.ParticleSystem.addEffect(effect);
};
