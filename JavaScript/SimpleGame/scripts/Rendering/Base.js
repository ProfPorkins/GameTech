/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for a /Components/Base object.
//
// ------------------------------------------------------------------
Demo.renderer.Base = (function(core) {
	'use strict';
	var that = {},
		totalTime = 0;

	// ------------------------------------------------------------------
	//
	// Renders a Base model.  Because the model can be rotated, that needs
	// to be done here, because the underlying sprite doesn't know
	// anything about rotation.
	//
	// ------------------------------------------------------------------
	that.render = function(model, elapsedTime) {
		var sin = Math.sin(totalTime),
			shieldStrength;

		core.saveContext();
		core.rotateCanvas(model.center, model.rotation);

		//
		// First, render the surrounding shield (if it exists)
		if (model.shield.strength > 0) {
			shieldStrength = 0.25 + (model.shield.strength / model.shield.max) * 0.50;
			Demo.renderer.core.drawFilledCircle(
				'rgba(0, 0, 255,' + shieldStrength + ')',
				model.center,
				model.shield.radius, true);
		}
		//
		// Next, draw the main base
		Demo.renderer.Sprite.render(model.sprite);

		//
		// This undoes the rotation very quickly
		core.restoreContext();
	};

	return that;
}(Demo.renderer.core));
