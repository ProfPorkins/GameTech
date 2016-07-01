/* global Demo */

//------------------------------------------------------------------
//
// Defines a 2D circle.  'spec' is defined as:
//	{
//		center: {x, y},
//		radius:
//		radiusSq: // Square of the radius
//	}
//
//------------------------------------------------------------------
Demo.components.Circle = function(spec) {
	'use strict';
	var radiusSq = spec.radius * spec.radius,
		that = {
			get center() { return spec.center; },
			get radius() { return spec.radius; },
			get radiusSq() { return radiusSq; }
		};

	//------------------------------------------------------------------
	//
	// Checks to see if the two circles intersect each other.  Returns
	// true if they do, false otherwise.
	//
	//------------------------------------------------------------------
	that.intersects = function(other) {
		var distance = Math.pow((spec.center.x - other.center.x), 2) + Math.pow((spec.center.y - other.center.y), 2);

		return (distance < Math.pow(spec.radius + other.radius, 2));
	};

	return that;
};
