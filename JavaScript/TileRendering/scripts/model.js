/* global Demo */

// ------------------------------------------------------------------
//
// This namespace holds the rotate to point demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components) {
	'use strict';
	var background = null,
		spaceShip = null,
		myMouse = input.Mouse(),
		myKeyboard = input.Keyboard(),
		that = {};

	// ------------------------------------------------------------------
	//
	// This function initializes the model.
	//
	// ------------------------------------------------------------------
	that.initialize = function() {
		//
		// Define the TiledImage model we'll be using for our background.
		background = components.TiledImage({
			size: { width: 5.0, height: 5 / 1.6667 },		// The image is a 1.6667 aspect ratio
			pixel: { width: 1280, height: 768 },
			tileSize: 128,
			assetKey: 'background'
		});

		background.setViewport(0.10, 0.00);

		//
		// Get our spaceship model and renderer created
		spaceShip = components.SpaceShip({
			size: { width: 0.08, height: 0.08 },
			center: { x: 0.5, y: 0.5 },
			target: { x: 0.5, y: 0.5 },
			rotation: 0,
			moveRate: 0.2 / 1000,		// World units per second
			rotateRate: Math.PI / 1000	// Radians per second
		});

		//
		// Whenever the mouse is clicked, set this as the target point
		// for the spaceship.
		myMouse.registerHandler(function(event) {
			spaceShip.setTarget(Demo.renderer.core.clientToWorld(event.clientX, event.clientY));
		},
			myMouse.EventMouseDown
		);

		myKeyboard.registerHandler(function(elapsedTime) {
			background.move(0.01, {x: 0.0, y: -1.0});
		},
			input.KeyEvent.DOM_VK_I, true
		);

		myKeyboard.registerHandler(function(elapsedTime) {
			background.move(0.01, {x: 0.0, y: 1.0});
		},
			input.KeyEvent.DOM_VK_K, true
		);

		myKeyboard.registerHandler(function(elapsedTime) {
			background.move(0.01, {x: -1.0, y: 0.0});
		},
			input.KeyEvent.DOM_VK_J, true
		);

		myKeyboard.registerHandler(function(elapsedTime) {
			background.move(0.01, {x: 1.0, y: 0.0});
		},
			input.KeyEvent.DOM_VK_L, true
		);
	};

	// ------------------------------------------------------------------
	//
	// Process all input for the model here.
	//
	// ------------------------------------------------------------------
	that.processInput = function(elapsedTime) {
		myMouse.update(elapsedTime);
		myKeyboard.update(elapsedTime);
	};

	// ------------------------------------------------------------------
	//
	// This function is used to update the state of the demo model.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {
		spaceShip.update(elapsedTime);
	};

	// ------------------------------------------------------------------
	//
	// This function renders the demo model.
	//
	// ------------------------------------------------------------------
	that.render = function(renderer) {

		renderer.TiledImage.render(background);

		renderer.SpaceShip.render(spaceShip);

		//
		// Draw a border around the unit world.
		renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);
	};

	return that;

}(Demo.input, Demo.components, Demo.assets));
