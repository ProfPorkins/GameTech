/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for a /Components/Base object.
//
// ------------------------------------------------------------------
Demo.renderer.Base = (function(core) {
	'use strict';
	var that = {};

	// ------------------------------------------------------------------
	//
	// Renders a Base model.  Because the model can be rotated, that needs
	// to be done here, because the underlying sprite doesn't know
	// anything about rotation.
	//
	// ------------------------------------------------------------------
	that.render = function(sprite) {

		core.saveContext();
		core.rotateCanvas(sprite.center, sprite.rotation);

		Demo.renderer.Sprite.render(sprite.sprite);

		//
		// This undoes the rotation very quickly
		core.restoreContext();
	};

	return that;
}(Demo.renderer.core));
