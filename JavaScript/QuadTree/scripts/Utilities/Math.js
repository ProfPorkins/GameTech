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
	// This method checks to see if any part of the circle is inside of
	// the square.  If it is, true is returned, false otherwise.
	//
	// This code adapted from: http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
	//
	//------------------------------------------------------------------
	that.circleTouchSquare = function(circle, square) {
		var squareX = square.left + square.size / 2,
			squareY = square.top + square.size / 2,
			circleDistanceX = Math.abs(circle.center.x - squareX),
			circleDistanceY = Math.abs(circle.center.y - squareY),
			cornerDistanceSq = 0;

		if (circleDistanceX > (square.size / 2 + circle.radius)) { return false; }
		if (circleDistanceY > (square.size / 2 + circle.radius)) { return false; }

		if (circleDistanceX <= (square.size / 2)) { return true; }
		if (circleDistanceY <= (square.size / 2)) { return true; }

		cornerDistanceSq = 	Math.pow((circleDistanceX - square.size / 2), 2) +
							Math.pow((circleDistanceY - square.size / 2), 2);

		return (cornerDistanceSq <= circle.radiusSq);
	};

	return that;
}());
