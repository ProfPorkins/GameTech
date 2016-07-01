/* global Demo */

// ------------------------------------------------------------------
//
// Input handling support
//
// ------------------------------------------------------------------
Demo.utilities.math = (function() {
	'use strict';
	var that = {};

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
		var boundingCircle = {
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

		boundingCircle.center.x = (midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x) / (slopeAB - slopeAC);
		boundingCircle.center.y = slopeAC * (boundingCircle.center.x - midPointAC.x) + midPointAC.y;
		//
		// Radius is distance from the center to any of the points
		boundingCircle.radius = Math.sqrt(Math.pow(boundingCircle.center.x - ptA.x, 2) + Math.pow(boundingCircle.center.y - ptA.y, 2));

		return Demo.components.Circle(boundingCircle);

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
