/* global Demo */

// ------------------------------------------------------------------
//
// This namespace holds the animated spritesheet demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components) {
	'use strict';
	var birdLittle = null,
		birdBig = null,
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
		birdLittle = components.Bird({
			size: { width: 0.1, height: 0.1 },
			center: { x: 0.05, y: 0.05 },
			rotation: 0,
			moveRate: 0.2 / 1000,		// World units per second
			rotateRate: Math.PI / 1000	// Radians per second
		});

		birdBig = components.Bird({
			size: { width: 0.2, height: 0.2 },
			center: { x: 0.1, y: 0.9 },
			rotation: 0,
			moveRate: 0.15/ 1000,
			rotateRate: Math.PI / 1000,
			animationScale: 1.5
		});

		myKeyboard.registerHandler(function(elapsedTime) {
				birdLittle.moveForward(elapsedTime);
			},
			input.KeyEvent.DOM_VK_W, true);
		myKeyboard.registerHandler(function(elapsedTime) {
				birdLittle.rotateRight(elapsedTime);
			},
			input.KeyEvent.DOM_VK_D, true);
		myKeyboard.registerHandler(function(elapsedTime) {
				birdLittle.rotateLeft(elapsedTime);
			},
			input.KeyEvent.DOM_VK_A, true);

		myKeyboard.registerHandler(function(elapsedTime) {
				birdBig.moveForward(elapsedTime);
			},
			input.KeyEvent.DOM_VK_I, true);
		myKeyboard.registerHandler(function(elapsedTime) {
				birdBig.rotateRight(elapsedTime);
			},
			input.KeyEvent.DOM_VK_L, true);
		myKeyboard.registerHandler(function(elapsedTime) {
				birdBig.rotateLeft(elapsedTime);
			},
			input.KeyEvent.DOM_VK_J, true);
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
		birdLittle.update(elapsedTime);
		birdBig.update(elapsedTime);
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

		renderer.Bird.render(birdLittle);
		renderer.Bird.render(birdBig);
	};

	return that;

}(Demo.input, Demo.components, Demo.assets));
