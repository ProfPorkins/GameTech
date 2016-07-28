/* global Demo */

//------------------------------------------------------------------
//
// Defines a SpaceShip component.  A Spaceship contains a sprite.
// The spec is defined as:
//	{
//		center: { x: , y: },		// In world coordinates
//		size: { width: , height: },	// In world coordinates
//		direction: { x: , y: },		// Direction of momentum
//		rotation: 	,				// Pointing angle, in radians
//		accelerationRate: 	,		// World units per second
//		rotateRate:					// Radians per second
//	}
//
//------------------------------------------------------------------
Demo.components.SpaceShip = function(spec) {
	'use strict';
	var sprite = null,
		that = {
			get center() { return sprite.center; },
			get size() { return spec.size; },
			get direction() { return spec.direction; },
			get rotation() { return spec.rotation; },
			get accelerateRate() { return spec.accelerateRate; },
			get sprite() { return sprite; }
		};

	//------------------------------------------------------------------
	//
	// Update the position of the ship based on its current momentum vector,
	// then tell the underlying sprite model to also update.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		sprite.center.x += (spec.direction.x * elapsedTime);
		sprite.center.y += (spec.direction.y * elapsedTime);

		sprite.update(elapsedTime);
	};

	//------------------------------------------------------------------
	//
	// Add momentum in the direction the ship is facing.
	//
	//------------------------------------------------------------------
	that.accelerate = function(elapsedTime) {
		var vectorX = Math.cos(spec.rotation),
			vectorY = Math.sin(spec.rotation);

		spec.direction.x += (vectorX * elapsedTime * spec.accelerationRate);
		spec.direction.y += (vectorY * elapsedTime * spec.accelerationRate);
		//
		// TODO: Set a max-speed
	};

	//------------------------------------------------------------------
	//
	// Rotate the model to the right
	//
	//------------------------------------------------------------------
	that.rotateRight = function(elapsedTime) {
		spec.rotation += spec.rotateRate * (elapsedTime);
	};

	//------------------------------------------------------------------
	//
	// Rotate the model to the left
	//
	//------------------------------------------------------------------
	that.rotateLeft = function(elapsedTime) {
		spec.rotation -= spec.rotateRate * (elapsedTime);
	};

	//
	// Get our sprite model
	sprite = Demo.components.Sprite({
		image: Demo.assets['spaceship'],
		spriteSize: spec.size,			// Let the sprite know about the size also
		spriteCenter: spec.center		// Maintain the center on the sprite
	});

	return that;
};
