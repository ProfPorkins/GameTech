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
	// Returns the magnitude of the 2D cross product.  The sign of the
	// magnitude tells you which direction to rotate to close the angle
	// between the two vectors.
	//
	//------------------------------------------------------------------
	that.crossProduct2d = function(v1, v2) {
		return (v1.x * v2.y) - (v1.y * v2.x);
	}

	//------------------------------------------------------------------
	//
	// Computes the angle, and direction (cross product) between two vectors.
	//
	//------------------------------------------------------------------
	that.computeAngle = function(rotation, ptCenter, ptTarget) {
		var v1 = {
				x : Math.cos(rotation),
				y : Math.sin(rotation)
			},
			v2 = {
				x : ptTarget.x - ptCenter.x,
				y : ptTarget.y - ptCenter.y
			},
			dp,
			angle,
			cp;

		v2.len = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
		v2.x /= v2.len;
		v2.y /= v2.len;

		dp = v1.x * v2.x + v1.y * v2.y;
		angle = Math.acos(dp);
		//
		// It is possible to get a NaN result, when that happens, set the angle to
		// 0 so that any use of it doesn't have to check for NaN.
		if (isNaN(angle)) {
			angle = 0;
		}

		//
		// Get the cross product of the two vectors so we can know
		// which direction to rotate.
		cp = that.crossProduct2d(v1, v2);

		return {
			angle : angle,
			crossProduct : cp
		};
	}

	return that;
}());
