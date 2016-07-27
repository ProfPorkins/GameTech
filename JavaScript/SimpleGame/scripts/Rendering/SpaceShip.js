/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for a /Components/SpaceShip object.
//
// ------------------------------------------------------------------
Demo.renderer.SpaceShip = (function(core) {
	'use strict';
	var that = {};

	// ------------------------------------------------------------------
	//
	// Renders a Spaceship model.  Because the model can be rotated, that needs
	// to be done here, because the underlying sprite doesn't know
	// anything about rotation.
	//
	// ------------------------------------------------------------------
	that.render = function(sprite, viewport) {
		//
		// Figure out the screen-space position of the spaceship by
		// using the viewport.
		var center = {
			x: sprite.center.x - viewport.left,
			y: sprite.center.y - viewport.top
		};
		core.saveContext();
		core.rotateCanvas(center, sprite.rotation);

		Demo.renderer.Sprite.render(sprite.sprite, viewport);

		//
		// This undoes the rotation very quickly
		core.restoreContext();
	};

	return that;
}(Demo.renderer.core));
