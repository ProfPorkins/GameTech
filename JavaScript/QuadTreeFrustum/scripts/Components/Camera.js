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
	// The length of the vector we are interested in is the hypotenuse
	// of a right triangle.  The formulate to compute the length of
	// the hypotenuse given the angle A and length of the adjacent side
	// is: h = adjacent / cos A
	//
	//------------------------------------------------------------------
	function computeFrustum() {
		var leftAngle = spec.direction - spec.fieldOfView / 2,
			rightAngle = spec.direction + spec.fieldOfView / 2,
			hypotenuse = spec.viewDistance / Math.cos(spec.fieldOfView / 2);

		frustum.leftPoint.x = spec.position.x + hypotenuse * Math.cos(leftAngle);
		frustum.leftPoint.y = spec.position.y + hypotenuse * Math.sin(leftAngle);
		frustum.rightPoint.x = spec.position.x + hypotenuse * Math.cos(rightAngle);
		frustum.rightPoint.y = spec.position.y + hypotenuse * Math.sin(rightAngle);
	}

	//------------------------------------------------------------------
	//
	// Move the camera forward based on its direction, speed, and elapsed time.
	//
	//------------------------------------------------------------------
	that.moveForward = function(elapsedTime) {
		//
		// Create a normalized direction vector
		var vectorX = Math.cos(spec.direction),
			vectorY = Math.sin(spec.direction);
		//
		// With the normalized direction vector, move the center of the sprite
		spec.position.x += (vectorX * spec.speed * (elapsedTime / 1000));
		spec.position.y += (vectorY * spec.speed * (elapsedTime / 1000));

		computeFrustum();
	};

	//------------------------------------------------------------------
	//
	// Move the camera backwards based on its direction, speed, and elapsed time.
	//
	//------------------------------------------------------------------
	that.moveBackward = function(elapsedTime) {
		//
		// Create a normalized direction vector
		var vectorX = Math.cos(spec.direction),
			vectorY = Math.sin(spec.direction);
		//
		// With the normalized direction vector, move the center of the sprite
		spec.position.x -= (vectorX * spec.speed * (elapsedTime / 1000));
		spec.position.y -= (vectorY * spec.speed * (elapsedTime / 1000));

		computeFrustum();
	};

	//------------------------------------------------------------------
	//
	// Rotate the camera left based on rotate rate and elapsed time.
	//
	//------------------------------------------------------------------
	that.rotateLeft = function(elapsedTime) {
		spec.direction -= spec.rotateRate * (elapsedTime / 1000);

		computeFrustum();
	};

	//------------------------------------------------------------------
	//
	// Rotate the camera right based on rotate rate and elapsed time.
	//
	//------------------------------------------------------------------
	that.rotateRight = function(elapsedTime) {
		spec.direction += spec.rotateRate * (elapsedTime / 1000);

		computeFrustum();
	};

	//
	// Add a movement and rotation rate into the spec
	spec.speed = 0.15;	// World units per second
	spec.rotateRate = Math.PI / 2;	// Radians per second

	//
	// During initialization, compute the viewing frustum based upon
	// the camera parameters
	computeFrustum();

	return that;
};
