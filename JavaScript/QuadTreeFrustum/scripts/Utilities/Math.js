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

	// ------------------------------------------------------------------
	//
	// Computes the circle that goes through the three points of a triangle.
	// Reference used: http://formulas.tutorvista.com/math/circumcenter-formula.html#
	// Other references I also looked at (not claiming how useful they were, but I considered them):
	//		https://en.wikipedia.org/wiki/Circumscribed_circle
	//		http://www.ics.uci.edu/~eppstein/junkyard/circumcenter.html
	//		http://cppgm.blogspot.com/2008/03/circle-through-three-points.html
	//		http://stackoverflow.com/questions/13977354/build-circle-from-3-points-in-3d-space-implementation-in-c-or-c
	//
	// ------------------------------------------------------------------
	that.circleFromTriangle = function(ptA, ptB, ptC) {
		var circleSpec = {
				center: {},
				radius: 0
			},
			midPointAB = {
				x: (ptA.x + ptB.x) / 2,
				y: (ptA.y + ptB.y) / 2
			},
			midPointAC = {
				x: (ptA.x + ptC.x) / 2,
				y: (ptA.y + ptC.y) / 2
			},
			slopeAB = (ptB.y - ptA.y) / (ptB.x - ptA.x),
			slopeAC = (ptC.y - ptA.y) / (ptC.x - ptA.x);
		slopeAB = -(1 / slopeAB);
		slopeAC = -(1 / slopeAC);

		circleSpec.center.x = (midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x) / (slopeAB - slopeAC);
		circleSpec.center.y = slopeAC * (circleSpec.center.x - midPointAC.x) + midPointAC.y;
		//
		// Radius is distance from the center to any of the points
		circleSpec.radius = Math.sqrt(Math.pow(circleSpec.center.x - ptA.x, 2) + Math.pow(circleSpec.center.y - ptA.y, 2));

		return Demo.components.Circle(circleSpec);

		//
		// Yes, I actually derived these equations all by my lonesome!
		//

		// y - midPointAB.y = slopeAB * (x -  midPointAB.x)
		// y = midPointAB.y + slopeAB * (x - midPointAB.x)
		// y - midPointAB.y = slopeAB * x - slopeAB * midPointAB.x
		// slopeAB * x = y - midPointAB.y + slopeAB * midPointAB.x
		// x = (y - midPointAB.y + slopeAB * midPointAB.x) / slopeAB

		// y - midPointAC.y = slopeAC(x - midPointAC.x)
		// y = slopeAC * (x - midPointAC.x) + midPointAC.y

		//
		// Solve for x
		// midPointAB.y + slopeAB * (x - midPointAB.x) = midPointAC.y + slopeAC * (x - midPointAC.x)
		// midPointAB.y + slopeAB * x - slopeAB * midPointAB.x = midPointAC.y + slopeAC * x - slopeAC * midPointAC.x
		// slopeAB * x - slopeAC * x = midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x
		// x * (slopeAB - slopeAC) = midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x
		// x = (midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x) / (slopeAB - slopeAC)
	};

	return that;
}());
