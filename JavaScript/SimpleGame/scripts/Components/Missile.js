/* global Demo */

//------------------------------------------------------------------
//
// Defines a missile fired from the player's ship.  A missile contains a sprite.
// The spec is defined as:
//	{
//		center: { x: , y: },		// In world coordinates
//		momentum: { x: , y: },		// Direction of momentum
//		lifetime:					// How long (in milliseconds) the missle can live
//	}
//
//
//------------------------------------------------------------------
Demo.components.Missile = function(spec) {
	'use strict';
	var sprite = null,
		that = {
			get type() { return Demo.components.Types.Missile; },
			get center() { return sprite.center; },
			get size() { return spec.size; },
			get momentum() { return spec.momentum; },
			get rotation() { return Math.atan2(spec.momentum.y, spec.momentum.x); },
			get damage() { return 1; },
			get sprite() { return sprite; }
		},
		boundingCircle = {
			get center() { return that.center; },
			get radius() { return that.size.width / 2; }
		};

	Object.defineProperty(that, 'boundingCircle', {
		get: function() { return boundingCircle; },
		enumerable: true,
		configurable: false
	});

	//------------------------------------------------------------------
	//
	// Update the position of the missile based on its current momentum vector,
	// then tell the underlying sprite model to also update.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		spec.alive += elapsedTime;
		if (spec.alive < spec.lifetime) {
			sprite.center.x += (spec.momentum.x * elapsedTime);
			sprite.center.y += (spec.momentum.y * elapsedTime);

			sprite.update(elapsedTime);

			return true;
		}

		return false;
	};

	//------------------------------------------------------------------
	//
	// Check to see if the Missle collides with another entity.
	//
	//------------------------------------------------------------------
	that.intersects = function(entity) {
		return Demo.utilities.math.circleCircleIntersect(entity.boundingCircle, that.boundingCircle);
	};

	//------------------------------------------------------------------
	//
	// Called when another entity gets within the 'vicinity' of this entity.
	//
	//------------------------------------------------------------------
	that.vicinity = function(entity) {
		//
		// Nothing to do here
	};

	//------------------------------------------------------------------
	//
	// Used to inform the missle that is collided with something at it's
	// current position.  We'll have it create a small particle explosion
	// when that happens.
	//
	//------------------------------------------------------------------
	that.collide = function(entity) {
		//
		// Only going to generate an effect if we hit another entity, there are
		// times when no entity was actually hit (like the border of the game world).
		if (entity) {
			Demo.components.ParticleSystem.createEffectExplosion({
				center: { x: sprite.center.x, y: sprite.center.y },
				howMany: 25
			});
			// Make a sound!
			Demo.assets['audio-missile-hit'].currentTime = 0;
			Demo.assets['audio-missile-hit'].play();
		}

		return false;
	};

	//
	// Missle knows its own size
	spec.size = { width: 0.04, height: 0.01 };
	spec.alive = 0;

	//
	// Get our sprite model
	sprite = Demo.components.Sprite({
		image: Demo.assets['missile-1'],
		spriteSize: spec.size,			// Let the sprite know about the size also
		spriteCenter: spec.center		// Maintain the center on the sprite
	});

	return that;
};
