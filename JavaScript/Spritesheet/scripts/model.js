/* global Demo */

// ------------------------------------------------------------------
//
// This namespace holds the input demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(components, assets) {
	'use strict';
	var birdSprite = null,
		that = {};

	// ------------------------------------------------------------------
	//
	// This function initializes the input demo model.  Only thing it
	// does right now is to register the resize event with the renderer.
	//
	// ------------------------------------------------------------------
	that.initialize = function() {

		//
		// Get our animated bird model and renderer created
		birdSprite = components.AnimatedSprite({
			spriteSheet: assets['animated-bird'],
			spriteSize: { width: 0.1, height: 0.1 },
			spriteCenter: { x: 0.05, y: 0.05 },
			spriteCount: 14,
			spriteTime: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
		});
	};

	// ------------------------------------------------------------------
	//
	// This function is used to update the state of the demo model.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {
		birdSprite.update(elapsedTime);
	};

	// ------------------------------------------------------------------
	//
	// This function renders the demo model.
	//
	// ------------------------------------------------------------------
	that.render = function(renderer) {

		//
		// Draw a border around the unit world.
		renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);

		renderer.AnimatedSprite.render(birdSprite, true);
	};

	return that;

}(Demo.components, Demo.assets));
