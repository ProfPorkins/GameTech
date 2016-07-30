/* global Demo */

//------------------------------------------------------------------
//
// Defines a missile fired from the player's ship.  A missile contains a sprite.
// The spec is defined as:
//	{
//		center: { x: , y: },		// In world coordinates
//		momentum: { x: , y: },		// Direction of momentum
//	}
//
//
//------------------------------------------------------------------
Demo.components.Missile = function(spec) {
	'use strict';
	var sprite = null,
		that = {
			get center() { return sprite.center; },
			get size() { return spec.size; },
			get momentum() { return spec.momentum; },
			get rotation() {
				return Math.atan2(spec.momentum.y, spec.momentum.x);
			},
			get sprite() { return sprite; }
		};

	//------------------------------------------------------------------
	//
	// Update the position of the missile based on its current momentum vector,
	// then tell the underlying sprite model to also update.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		sprite.center.x += (spec.momentum.x * elapsedTime);
		sprite.center.y += (spec.momentum.y * elapsedTime);

		sprite.update(elapsedTime);
	};

	//
	// Missle knows its own size
	spec.size = { width: 0.04, height: 0.01 };

	//
	// Get our sprite model
	sprite = Demo.components.Sprite({
		image: Demo.assets['missile-1'],
		spriteSize: spec.size,			// Let the sprite know about the size also
		spriteCenter: spec.center		// Maintain the center on the sprite
	});

	return that;
};
