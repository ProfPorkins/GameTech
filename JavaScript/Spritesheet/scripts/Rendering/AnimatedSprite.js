/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for an /Components/AnimatedSprite object.
//
// ------------------------------------------------------------------
Demo.renderer.AnimatedSprite = (function(core) {
	'use strict';
	var that = {};

	that.render = function(sprite) {
		//context.save();

		//context.translate(spec.center.x, spec.center.y);
		//context.rotate(spec.rotation);
		//context.translate(-spec.center.x, -spec.center.y);

		//
		// Pick the selected sprite from the sprite sheet to render
		core.drawImage(
			sprite.spriteSheet,
			sprite.pixelWidth * sprite.sprite, 0,	// Which sprite to pick out
			sprite.pixelWidth, sprite.pixelHeight,		// The size of the sprite
			sprite.center.x - sprite.width / 2,	// Where to draw the sprite
			sprite.center.y - sprite.height / 2,
			sprite.width, sprite.height);

		//context.restore();
	};

	return that;
}(Demo.renderer.core));