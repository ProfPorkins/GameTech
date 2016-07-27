/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for an /Components/Sprite object.
//
// ------------------------------------------------------------------
Demo.renderer.Sprite = (function(core) {
	'use strict';
	var that = {};

	that.render = function(sprite, viewport) {
		//
		// Pick the selected sprite from the sprite sheet to render
		core.drawImage(
			sprite.image,
			sprite.center.x - viewport.left - sprite.width / 2,		// Where to draw the sprite
			sprite.center.y - viewport.top - sprite.height / 2,
			sprite.width, sprite.height);
	};

	return that;
}(Demo.renderer.core));
