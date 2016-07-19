/* global Demo, Random */

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
Demo.components.ParticleSystem.createEffectFire = function(spec) {
	'use strict';
	var effect = { },
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
			Demo.components.ParticleSystem.createParticle({
				image: Demo.assets['fire'],
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
			Demo.components.ParticleSystem.createParticle({
				image: Demo.assets['smoke'],
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

	return Demo.components.ParticleSystem.addEffect(effect);
};
