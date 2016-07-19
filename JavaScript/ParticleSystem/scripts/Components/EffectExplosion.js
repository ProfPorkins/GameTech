/* global Demo, Random */

//------------------------------------------------------------------
//
// Creates an explostion effect that emits all particles at creation time.
// The spec is defined as:
// {
//		center: { x: , y: },
//		howMany: // How many particles to emit
// }
//
//------------------------------------------------------------------
Demo.components.ParticleSystem.createEffectExplosion = function(spec) {
	'use strict';
	var effect = { },
		particle = 0;

	effect.update = function() {
		for (particle = 0; particle < spec.howMany; particle += 1) {
			//
			// Create a new fire particle
			Demo.components.ParticleSystem.createParticle({
				image: Demo.assets['fire'],
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

	return Demo.components.ParticleSystem.addEffect(effect);
};
