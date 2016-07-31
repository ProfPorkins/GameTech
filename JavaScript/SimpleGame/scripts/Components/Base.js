/* global Demo */

//------------------------------------------------------------------
//
// Defines a Base component.  A Base contains a sprite.
// The spec is defined as:
//	{
//		center: { x: , y: }			// In world coordinates
//		radius: 					// In world coordinates
//		rotation: 					// In Radians
//		rotateRate:					// Radians per second
//		hitPoints: {
//			max:					// Maximum hit points for the base
//		},
//		shield: {
//			thickness:				// In world coordinates
//			max:					// Maximum value for the shield, also the starting strength
//		}
//	}
//
//------------------------------------------------------------------
Demo.components.Base = function(spec) {
	'use strict';
	var sprite = null,
		shield = {
			get radius() { return spec.radius + spec.shield.thickness; },
			get strength() { return spec.shield.strength; },
			get max() { return spec.shield.max; }
		},
		that = {
			get type() { return Demo.components.Types.Base; },
			get center() { return sprite.center; },
			get radius() { return spec.radius; },
			get rotation() { return spec.rotation; },
			get hitPoints() { return spec.hitPoints; },
			get shield() { return shield; },
			get sprite() { return sprite; },
		},
		boundingCircle = {
			get center() { return that.center; },
			get radius() { return that.radius; }
		},
		regenerationTime = 0;

	Object.defineProperty(that, 'boundingCircle', {
		get: function() { return boundingCircle; },
		enumerable: true,
		configurable: false
	});

	//------------------------------------------------------------------
	//
	// Tell the sprite to update and continue to rotate the base.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		sprite.update(elapsedTime);
		spec.rotation += (spec.rotateRate * elapsedTime);

		//
		// Shields regenerate every 1 second
		regenerationTime += elapsedTime;
		if (regenerationTime >= 1000) {
			spec.shield.strength = Math.min(spec.shield.strength + 1, spec.shield.max);
			regenerationTime -= 1000;
		}

		return true;
	};

	//------------------------------------------------------------------
	//
	// Check to see if the Base collides with another entity.
	//
	//------------------------------------------------------------------
	that.intersects = function(entity) {
		return Demo.utilities.math.circleCircleIntersect(entity.boundingCircle, that.boundingCircle);
	}

	//------------------------------------------------------------------
	//
	// Handle the collision behavior for when the Base collides with another entity.
	//
	//------------------------------------------------------------------
	that.collide = function(entity) {
		var keepAlive = true;

		if (that.shield.strength > 0) {
			spec.shield.strength = Math.max(spec.shield.strength - entity.damage, 0);
		} else {
			spec.hitPoints.strength = Math.max(spec.hitPoints.strength - entity.damage, 0);
			if (spec.hitPoints.strength <= 0) {
				keepAlive = false;
				//
				// Make a nice big explosion when this happens!
				Demo.components.ParticleSystem.createEffectExplosion({
					center: { x: that.center.x, y: that.center.y },
					howMany: 1000
				});
			}
		}
		//
		// No matter what happens, reset the next shild regeneration time.
		regenerationTime = 0;

		return keepAlive;
	};

	//
	// Set the initial shild and base strengths
	spec.hitPoints.strength = spec.hitPoints.max;
	spec.shield.strength = spec.shield.max;

	//
	// Get our sprite model
	sprite = Demo.components.Sprite({
		image: Demo.assets['base-red'],
		spriteSize: { width: spec.radius * 2, height: spec.radius * 2 },	// Maintain the size on the sprite
		spriteCenter: spec.center	// Maintain the center on the sprite
	});

	return that;
};
