/* global Demo */

// ------------------------------------------------------------------
//
// This namespace holds the input demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components) {
	'use strict';
	var bird = null,
		myKeyboard = input.Keyboard(),
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
		bird = components.Bird({
			size: { width: 0.1, height: 0.1 },
			center: { x: 0.05, y: 0.05 }
		});

		myKeyboard.registerHandler(function(elapsedTime) {
				bird.moveForward(elapsedTime);
			},
			input.KeyEvent.DOM_VK_W, true);
		myKeyboard.registerHandler(function(elapsedTime) {
				bird.rotateRight(elapsedTime);
			},
			input.KeyEvent.DOM_VK_D, true);
		myKeyboard.registerHandler(function(elapsedTime) {
				bird.rotateLeft(elapsedTime);
			},
			input.KeyEvent.DOM_VK_A, true);
	};

	// ------------------------------------------------------------------
	//
	// Process all input for the model here.
	//
	// ------------------------------------------------------------------
	that.processInput = function(elapsedTime) {
		myKeyboard.update(elapsedTime);
	};

	// ------------------------------------------------------------------
	//
	// This function is used to update the state of the demo model.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {
		bird.update(elapsedTime);
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

		renderer.Bird.render(bird);
	};

	return that;

}(Demo.input, Demo.components, Demo.assets));
