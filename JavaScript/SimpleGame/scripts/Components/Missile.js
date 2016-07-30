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

		return true;
	};

	//------------------------------------------------------------------
	//
	// Used to inform the missle that is collided with something at it's
	// current position.  We'll have it create a small particle explosion
	// when that happens.
	//
	//------------------------------------------------------------------
	that.collide = function(entity) {
		Demo.components.ParticleSystem.createEffectExplosion({
			center: { x: sprite.center.x, y: sprite.center.y },
			howMany: 100
		});
		return false;
	}

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
