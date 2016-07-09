/* global Demo */

//------------------------------------------------------------------
//
// Defines a Bird component.  A bird contains an animated sprite.
// The sprite is defined as:
//	{
//	}
//
//------------------------------------------------------------------
Demo.components.Bird = function(spec) {
	'use strict';
	var sprite = null,
		that = {
			get center() { return sprite.center; },
			get sprite() { return sprite; },
			get rotation() { return spec.rotation; }
		};

	that.update = function(elapsedTime) {
		sprite.update(elapsedTime, true);
	};

	that.rotateRight = function(elapsedTime) {
		spec.rotation += spec.rotateRate * (elapsedTime);
	};

	that.rotateLeft = function(elapsedTime) {
		spec.rotation -= spec.rotateRate * (elapsedTime);
	};

	//------------------------------------------------------------------
	//
	// Move in the direction the sprite is facing
	//
	//------------------------------------------------------------------
	that.moveForward = function(elapsedTime) {
		//
		// Create a normalized direction vector
		var vectorX = Math.cos(spec.rotation + spec.orientation),
			vectorY = Math.sin(spec.rotation + spec.orientation);
		//
		// With the normalized direction vector, move the center of the sprite
		sprite.center.x += (vectorX * spec.moveRate * elapsedTime);
		sprite.center.y += (vectorY * spec.moveRate * elapsedTime);
	};

	//
	// Get our animated bird model and renderer created
	sprite = Demo.components.AnimatedSprite({
		spriteSheet: Demo.assets['animated-bird'],
		spriteCount: 14,
		spriteTime: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
		spriteSize: spec.size,
		spriteCenter: spec.center
	});

	spec.orientation = 0;
	spec.rotation = 0;
	spec.moveRate = 0.2 / 1000;			// World units per millisecond
	spec.rotateRate = 3.14159 / 1000;		// Radians per millisecond

	return that;
};
