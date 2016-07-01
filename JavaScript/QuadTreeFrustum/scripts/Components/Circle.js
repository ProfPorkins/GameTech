/* global Demo */

//------------------------------------------------------------------
//
// Defines a 2D circle.  'spec' is defined as:
//	{
//		center: {x, y},
//		direction:  {x, y},
//		radius:
//	}
//
//------------------------------------------------------------------
Demo.components.Circle = function(spec) {
	'use strict';
	var that = {
			get center() { return spec.center; },
			get radius() { return spec.radius; }
		},
		radiusSq = spec.radius * spec.radius;

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

	//------------------------------------------------------------------
	//
	// This function is required by the QuadTree.  It checks to see if
	// any part of the circle is inside of the square.  If it is, true is
	// returned, false otherwise.
	//
	// This code adapted from: http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
	//
	//------------------------------------------------------------------
	that.insideSquare = function(square) {
		var squareX = square.left + square.size / 2,
			squareY = square.top + square.size / 2,
			circleDistanceX = Math.abs(that.center.x - squareX),
			circleDistanceY = Math.abs(that.center.y - squareY),
			cornerDistanceSq = 0;

		if (circleDistanceX > (square.size / 2 + that.radius)) { return false; }
		if (circleDistanceY > (square.size / 2 + that.radius)) { return false; }

		if (circleDistanceX <= (square.size / 2)) { return true; }
		if (circleDistanceY <= (square.size / 2)) { return true; }

		cornerDistanceSq = 	Math.pow((circleDistanceX - square.size / 2), 2) +
							Math.pow((circleDistanceY - square.size / 2), 2);

		return (cornerDistanceSq <= radiusSq);
	};

	return that;
};
