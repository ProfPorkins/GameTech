/* global Demo */

//------------------------------------------------------------------
//
// Defines a 2D viewing frustum.
//
//------------------------------------------------------------------
Demo.components.Frustum = function(spec) {
	'use strict';
	var that = {
		get position() { return spec.position; },
		get direction() { return spec.direction; },
		get FOV() { return spec.fieldOfView; },
		get viewDistance() { return spec.viewDistance; }
	};


	return that;
};
