/* global Demo */

// ------------------------------------------------------------------
//
// This namespace holds the type enumerations for the different components
// used by the gameplay code.
//
// ------------------------------------------------------------------
Demo.components.Types = (function() {
	'use strict';
	var that = {
		get SpaceShip() { return 0; },
		get Missile() { return 1; },
		get Base() { return 2; }
	};

	return that;
}());
