/* global Demo */

//------------------------------------------------------------------
//
// Defines a SpaceShip component.  A Spaceship contains a sprite.
// The spec is defined as:
//	{
//		center: { x: , y: },		// In world coordinates
//		size: { width: , height: },	// In world coordinates
//		momentum: { x: , y: },		// Direction of momentum
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
			get momentum() { return spec.momentum; },
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
		sprite.center.x += (spec.momentum.x * elapsedTime);
		sprite.center.y += (spec.momentum.y * elapsedTime);

		sprite.update(elapsedTime);

		return true;
	};

	that.collide = function(entity) {
		return true;
	}

	//------------------------------------------------------------------
	//
	// Fire a missle from the spaceship.
	//
	//------------------------------------------------------------------
	that.fire = function(report) {
		var missile = undefined,
			x = Math.cos(that.rotation) / 1000,
			y = Math.sin(that.rotation) / 1000;

		missile = Demo.components.Missile({
			center : { x: that.center.x, y: that.center.y },
			momentum: { x: spec.momentum.x + x, y: spec.momentum.y + y }
		});

		//
		// Report the firing of the missle back to the calling code.
		report(missile, Demo.renderer.Missile);
	};

	//------------------------------------------------------------------
	//
	// Add momentum in the direction the ship is facing.
	//
	//------------------------------------------------------------------
	that.accelerate = function(elapsedTime) {
		var vectorX = Math.cos(spec.rotation),
			vectorY = Math.sin(spec.rotation),
			newSpeed = 0;

		spec.momentum.x += (vectorX * elapsedTime * spec.accelerationRate);
		spec.momentum.y += (vectorY * elapsedTime * spec.accelerationRate);
		//
		// Ensure we are still at or below the max speed
		newSpeed = Math.sqrt(Math.pow(spec.momentum.x, 2) + Math.pow(spec.momentum.y, 2));
		if (newSpeed > spec.maxSpeed) {
			//
			// Modify the vector to keep the magnitude equal to the max possible speed.
			spec.momentum.x /= (newSpeed / spec.maxSpeed);
			spec.momentum.y /= (newSpeed / spec.maxSpeed);
		}
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