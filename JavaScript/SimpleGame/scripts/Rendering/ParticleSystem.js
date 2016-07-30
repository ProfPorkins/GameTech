/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for a /Components/Text object.
//
// ------------------------------------------------------------------
Demo.renderer.ParticleSystem = (function(core) {
	'use strict';
	var that = {};

	// ------------------------------------------------------------------
	//
	// Work through all of the known particles and draw them.
	//
	// ------------------------------------------------------------------
	that.render = function(system) {
		var value = 0,
			particle = null;

		for (value = 0; value < system.particleCount; value += 1) {
			particle = system.particles[value];

			core.saveContext();
			core.rotateCanvas(particle.center, particle.rotation);

			core.drawImage(
				particle.image,
				particle.center.x - particle.size / 2,		// Where to draw the sprite
				particle.center.y - particle.size / 2,
				particle.size, particle.size);

			core.restoreContext();
		}
	};

	return that;
}(Demo.renderer.core));
