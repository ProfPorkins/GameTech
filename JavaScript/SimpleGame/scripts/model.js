/* global Demo */

// ------------------------------------------------------------------
//
// This namespace holds the rotate to point demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components, assets) {
	'use strict';
	var world = {	// The size of the world must match the world-size of the background image
			get left() { return 0; },
			get top() { return 0; },
			get width() { return 5; },
			get height() { return 3; },
			get buffer() { return 0.15; }
		},
		viewport = components.Viewport({
			left: 0,
			top: 0,
			buffer: 0.15	// This can't really be any larger than world.buffer, guess I could protect against that.
		}),
		background = null,
		spaceShip = null,
		myKeyboard = input.Keyboard(),
		that = {};

	// ------------------------------------------------------------------
	//
	// Handles movement of the spaceship over the background.  As the ship
	// approaches one of the imaginary boundaries of the visible area, the
	// background is moved around the ship, rather than moving the ship.
	//
	// ------------------------------------------------------------------
	function moveForward(elapsedTime) {
		var proposedCenter = spaceShip.proposedMove(elapsedTime),
			shipCenter = {
				x: proposedCenter.x,
				y: proposedCenter.y
			};

		if (proposedCenter.x >= (world.width - world.buffer) || proposedCenter.x <= (world.left + world.buffer)) {
			shipCenter.x = (proposedCenter.x >= (world.width - world.buffer)) ? (world.width - world.buffer) : (world.left + world.buffer);
		}
		if (proposedCenter.y >= (world.height - world.buffer) || proposedCenter.y <= (world.top + world.buffer)) {
			shipCenter.y = (proposedCenter.y >= (world.height - world.buffer)) ? (world.height - world.buffer) : (world.top + world.buffer);
		}

		spaceShip.center.x = shipCenter.x;
		spaceShip.center.y = shipCenter.y;

		//
		// Viewport only needs to be updated when the spaceship moves.
		viewport.update(spaceShip);
	}

	// ------------------------------------------------------------------
	//
	// This function initializes the model.
	//
	// ------------------------------------------------------------------
	that.initialize = function() {
		//
		// Define the TiledImage model we'll be using for our background.
		var backgroundKey = 'background';
		background = components.TiledImage({
			pixel: { width: assets[backgroundKey].width, height: assets[backgroundKey].height },
			size: { width: world.width, height: world.height },
			tileSize: assets[backgroundKey].tileSize,
			assetKey: backgroundKey
		});

		background.setViewport(0.00, 0.00);

		//
		// Get our spaceship model and renderer created
		spaceShip = components.SpaceShip({
			size: { width: 0.06, height: 0.06 },
			center: { x: 0.5, y: 0.5 },
			rotation: 0,
			moveRate: 0.4 / 1000,		// World units per second
			rotateRate: Math.PI / 1000	// Radians per second
		});

		myKeyboard.registerHandler(function(elapsedTime) {
			moveForward(elapsedTime);
		},
			input.KeyEvent.DOM_VK_W, true
		);

		myKeyboard.registerHandler(function(elapsedTime) {
			spaceShip.rotateLeft(elapsedTime);
		},
			input.KeyEvent.DOM_VK_A, true
		);

		myKeyboard.registerHandler(function(elapsedTime) {
			spaceShip.rotateRight(elapsedTime);
		},
			input.KeyEvent.DOM_VK_D, true
		);
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
		spaceShip.update(elapsedTime);
	};

	// ------------------------------------------------------------------
	//
	// This function renders the demo model.
	//
	// ------------------------------------------------------------------
	that.render = function(renderer) {

		renderer.TiledImage.render(background, viewport);
		renderer.SpaceShip.render(spaceShip, viewport);

		//
		// Draw a border around the unit world.
		renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);
	};

	return that;

}(Demo.input, Demo.components, Demo.assets));
