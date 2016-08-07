/* global Demo */

//------------------------------------------------------------------
//
// Defines a base Entity component.
// The spec is defined as:
//	{
//		center: { x: , y: }			// In world coordinates
//   ** Either 'size' or 'radius' must be defined **
//	 	size: { width: , height: }	// In world coordinates
//		radius: 					// In world coordinates
//		momentum: { x: , y: }		// Direction of momentum
//		orientation:				// Pointing angle, in radians
//		hitPoints: {
//			max: 					// Max/initial possible hit points for the space ship
//		}
//	}
//
//------------------------------------------------------------------
Demo.components.Entity = function(spec, spriteName) {
	'use strict';
	var sprite = undefined,
		that = {
			get type() { return Demo.components.Types.Undefined; },
			get center() { return sprite.center; },
			get size() { return spec.size; },
			get momentum() { return spec.momentum; },
			get orientation() { return spec.orientation; },
			get hitPoints() { return spec.hitPoints; },
			get sprite() { return sprite; }
		},
		boundingCircle = undefined,
		deathHandler = undefined;

	//
	// An entity may be defined in terms of a rectangular size or a radius.  Depending
	// upon how it is defined, create the boundingCircle accordingly.
	if (spec.hasOwnProperty('size')) {
		boundingCircle = {
			get center() { return that.center; },
			get radius() { return that.size.width / 2; }
		}
	} else if (spec.hasOwnProperty('radius')) {
		boundingCircle = {
			get center() { return that.center; },
			get radius() { return that.radius; }
		}
	} else {
		throw 'Entity does not define either "size" or "radius"';
	}

	Object.defineProperty(that, 'boundingCircle', {
		get: function() { return boundingCircle; },
		enumerable: true,
		configurable: false
	});

	//------------------------------------------------------------------
	//
	// Update the position of the entity based on its current momentum vector.
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
	// Check to see if the entity collides with another entity.
	//
	//------------------------------------------------------------------
	that.intersects = function(entity) {
		return Demo.utilities.math.circleCircleIntersect(entity.boundingCircle, that.boundingCircle);
	}

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
	// Handle the collision behavior of the entity with another entity.
	//
	//------------------------------------------------------------------
	that.collide = function(entity) {
		return true;
	}

	//------------------------------------------------------------------
	//
	// Allows client code to be notified upon the death of this spaceship.
	//
	//------------------------------------------------------------------
	that.registerDeathHanlder = function(handler) {
		deathHandler = handler;
	}

	//
	// Set the initial number of hit points
	spec.hitPoints.strength = spec.hitPoints.max;

	//
	// Get our sprite model
	sprite = Demo.components.Sprite({
		image: Demo.assets[spriteName],
		spriteSize: spec.size,			// Let the sprite know about the size also
		spriteCenter: spec.center		// Maintain the center on the sprite
	});

	return that;
};
