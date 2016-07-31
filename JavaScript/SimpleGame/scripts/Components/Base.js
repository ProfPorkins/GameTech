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
//		vicinity:					// In world coordinates
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
		regenerationTime = 0,
		lastMissileFired = 0;

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

		//
		// Update how long since last missle was fired
		lastMissileFired += elapsedTime;

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
	// Called when another entity gets within the 'vicinity' of this entity.
	//
	//------------------------------------------------------------------
	that.vicinity = function(entity, report) {
		var distance,
			missile,
			direction = undefined,
			magnitude;

		//
		// If the other entity is a spaceship and is within our vicinity, then
		// fire a missle if we haven't fired one in the last X milliseconds.
		if (entity.type === Demo.components.Types.SpaceShip) {
			distance = Math.sqrt(Math.pow(entity.center.x - that.center.x, 2) + Math.pow(entity.center.y - that.center.y, 2));
			if (distance <= spec.vicinity && lastMissileFired > 1000) {
				lastMissileFired = 0;
				direction = {
					x: entity.center.x - that.center.x,
					y: entity.center.y - that.center.y
				};
				magnitude = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2));

				direction.x = (direction.x / magnitude) / 5000;
				direction.y = (direction.y / magnitude) / 5000;

				missile = Demo.components.TrackingMissile({
					center : { x: that.center.x, y: that.center.y },
					target: entity,
					momentum: { x: direction.x, y: direction.y },
					rotateRate: Math.PI / 1000,
					lifetime: 3000
				});

				//
				// Report the firing of the missle back to the calling code.
				report(missile, Demo.renderer.Missile);
			}
		}
	};

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
