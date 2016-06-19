/* global QuadTreeDemo */
//------------------------------------------------------------------
//
// This namespace holds the different game components from which the
// game model is componsed.
//
//------------------------------------------------------------------
QuadTreeDemo.components = (function() {
	'use strict';
	//
	// Various constants; as best as we can do them in ECMAScript 5
	var Constants = {
		get NumberOfCircles() { return 200; }
	};

	//------------------------------------------------------------------
	//
	// A circle has a center, direction, speed, and size.
	//
	//------------------------------------------------------------------
	function Circle(spec) {
		var that = {
			get center() { return spec.center; },
			get direction() { return spec.direction; },
			set direction(value) { spec.direction = value; },
			get speed() { return spec.speed; },
			get radius() { return spec.radius; }
		};

		// ------------------------------------------------------------------
		//
		// We are going to use this for our circle-square intersection testing.
		//
		// ------------------------------------------------------------------
		Math.clamp = function(value, min, max) {
			return Math.max(min, Math.min(max, value));
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
			var closestX = Math.clamp(that.center.x, square.left, square.left + square.size),
				closestY = Math.clamp(that.center.y, square.top, square.top + square.size),
				distanceX = that.center.x - closestX,
				distanceY = that.center.y - closestY,
				distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

			return distanceSquared < (that.radius * that.radius);
		};

		//------------------------------------------------------------------
		//
		// Move the circle based upon its current speed, elapsed time and
		// direction vector.  When the circle goes outside of the unit world,
		// have it enter at the appropriate side of the world based on its
		// position.
		//
		//------------------------------------------------------------------
		that.update = function(elapsedTime) {
			//
			// Divide by 1000 to convert elapsedTime from milliseconds to seconds
			spec.center.x += (spec.direction.x * elapsedTime / 1000);
			spec.center.y += (spec.direction.y * elapsedTime / 1000);
			//
			// If the circle hits the world walls, reflect its direction.
			if ((spec.center.x < spec.radius) || (spec.center.x > (1.0 - spec.radius))) {
				spec.direction.x *= -1;
				//
				// Move the circle radius distance away from the edge so we don't
				// get stuck on it.
				spec.center.x = Math.max(spec.center.x, spec.radius);
				spec.center.x = Math.min(spec.center.x, 1.0 - spec.radius);
			}
			if ((spec.center.y < spec.radius) || (spec.center.y > (1.0 - spec.radius))) {
				spec.direction.y *= -1;
				//
				// Move the circle radius distance away from the edge so we don't
				// get stuck on it.
				spec.center.y = Math.max(spec.center.y, spec.radius);
				spec.center.y = Math.min(spec.center.y, 1.0 - spec.radius);
			}
		};

		return that;
	}

	return {
		Constants: Constants,
		Circle: Circle
	};

}());
