/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for a /Components/Text object.
//
// ------------------------------------------------------------------
Demo.renderer.ParticleSystem = (function(core) {
	'use strict';
	var that = {};

	that.render = function(system) {
		var value = 0,
			particle = null;

		for (value in system.particles) {
			if (system.particles.hasOwnProperty(value)) {
				particle = system.particles[value];

				core.saveContext();
				core.rotateCanvas(particle.center, particle.rotation);

				core.drawImage(
					particle.image,
					0, 0,	// Which sprite to pick out
					particle.image.width, particle.image.height,	// The size of the sprite in the sprite sheet
					particle.center.x - particle.size / 2,		// Where to draw the sprite
					particle.center.y - particle.size / 2,
					particle.size, particle.size);

				core.restoreContext();
			}
		}
	};

	return that;
}(Demo.renderer.core));
