/* global Demo */

//------------------------------------------------------------------
//
// Defines a 2D viewing camera.
//
//------------------------------------------------------------------
Demo.components.Camera = function(spec) {
	'use strict';
	var frustum = {
			leftPoint: { x: 0, y: 0 },
			rightPoint: { x: 0, y: 0 }
		},
		that = {
			get position() { return spec.position; },
			get direction() { return spec.direction; },
			get FOV() { return spec.fieldOfView; },
			get viewDistance() { return spec.viewDistance; },
			get frustum() { return frustum; }
		};

	//------------------------------------------------------------------
	//
	// Compute the far, left, and right line segments based upon the
	// camera parameters.
	//
	//------------------------------------------------------------------
	function computeFrustum() {
		var viewAngle = Math.atan2(spec.direction.y, spec.direction.x),
			leftAngle = viewAngle - spec.fieldOfView / 2,
			rightAngle = viewAngle + spec.fieldOfView / 2;

		frustum.leftPoint.x = spec.position.x + spec.viewDistance * Math.cos(leftAngle);
		frustum.leftPoint.y = spec.position.y + spec.viewDistance * Math.sin(leftAngle);
		frustum.rightPoint.x = spec.position.x + spec.viewDistance * Math.cos(rightAngle);
		frustum.rightPoint.y = spec.position.y + spec.viewDistance * Math.sin(rightAngle);
	}

	//
	// During initialization, compute the viewing frustum based upon
	// the camera parameters
	computeFrustum();

	return that;
};
