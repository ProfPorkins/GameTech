/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for an /Components/Bird object.
//
// ------------------------------------------------------------------
Demo.renderer.Bird = (function(core) {
	'use strict';
	var that = {};

	that.render = function(sprite) {
		core.saveContext();

		core.rotateCanvas(sprite.center, sprite.rotation);
		Demo.renderer.AnimatedSprite.render(sprite.sprite);

		core.restoreContext();
	};

	return that;
}(Demo.renderer.core));
