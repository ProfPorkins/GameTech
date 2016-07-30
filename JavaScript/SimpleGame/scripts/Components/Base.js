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
//	}
//
//------------------------------------------------------------------
Demo.components.Base = function(spec) {
	'use strict';
	var sprite = null,
		shield = {
			get radius() { return spec.radius + spec.shield.thickness; },
			get strength() { return spec.shield.strength; }
		},
		that = {
			get center() { return sprite.center; },
			get radius() { return spec.radius; },
			get rotation() { return spec.rotation; },
			get sprite() { return sprite; },
			get shield() { return shield; }
		};

	//------------------------------------------------------------------
	//
	// Tell the sprite to update and continue to rotate the base.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		sprite.update(elapsedTime);
		spec.rotation += (spec.rotateRate * elapsedTime);

		return true;
	};

	that.collide = function(entity) {
		return true;
	}

	//
	// Get our sprite model
	sprite = Demo.components.Sprite({
		image: Demo.assets['base-red'],
		spriteSize: { width: spec.radius * 2, height: spec.radius * 2 },	// Maintain the size on the sprite
		spriteCenter: spec.center	// Maintain the center on the sprite
	});

	return that;
};