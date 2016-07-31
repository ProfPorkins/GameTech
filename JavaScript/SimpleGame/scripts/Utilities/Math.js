/* global Demo */

// ------------------------------------------------------------------
//
// Input handling support
//
// ------------------------------------------------------------------
Demo.utilities.math = (function() {
	'use strict';
	var that = {};

	//------------------------------------------------------------------
	//
	// Simple helper function to help testing a value with some level of tolerance.
	//
	//------------------------------------------------------------------
	that.testTolerance = function(value, test, tolerance) {
		if (Math.abs(value - test) < tolerance) {
			return true;
		}

		return false;
	};

	//------------------------------------------------------------------
	//
	// Tests to see if two circles intersect with each other.
	//
	//------------------------------------------------------------------
	that.circleCircleIntersect = function(circle1, circle2) {
		var distance = Math.pow((circle1.center.x - circle2.center.x), 2) + Math.pow((circle1.center.y - circle2.center.y), 2);

		return (distance < Math.pow(circle1.radius + circle2.radius, 2));
	};

	//------------------------------------------------------------------
	//
	// This method checks to see if any part of the circle is inside of
	// the square.  If it is, true is returned, false otherwise.
	//
	// This code adapted from: http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
	//
	//------------------------------------------------------------------
	that.circleTouchSquare = function(circle, square) {
		var squareSizeby2 = square.size / 2,
			circleDistanceX,
			circleDistanceY,
			distanceX,
			distanceY,
			cornerDistanceSq;

		circleDistanceX = Math.abs(circle.center.x - square.center.x);
		if (circleDistanceX > (squareSizeby2 + circle.radius)) { return false; }
		circleDistanceY = Math.abs(circle.center.y - square.center.y);
		if (circleDistanceY > (squareSizeby2 + circle.radius)) { return false; }

		if (circleDistanceX <= squareSizeby2) { return true; }
		if (circleDistanceY <= squareSizeby2) { return true; }

		distanceX = (circleDistanceX - squareSizeby2);
		distanceY = (circleDistanceY - squareSizeby2);
		distanceX *= distanceX;
		distanceY *= distanceY;

		cornerDistanceSq = distanceX + distanceY;

		return (cornerDistanceSq <= circle.radiusSq);
	};

	return that;
}());
