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
		background = null,
		spaceShip = null,
		baseRed = null,
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
		Demo.renderer.core.viewport.update(spaceShip);
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

		//
		// Get our spaceship model and renderer created
		spaceShip = components.SpaceShip({
			size: { width: 0.06, height: 0.06 },
			center: { x: 0.5, y: 0.5 },
			rotation: 0,
			moveRate: 0.4 / 1000,		// World units per second
			rotateRate: Math.PI / 1000	// Radians per second
		});

		baseRed = components.Base({
			center: { x: 0.75, y: 0.75 },
			radius: 0.10,
			rotation: 0,
			rotateRate: (Math.PI / 4) / 1000,	// Slow rotation
			shield: {
				thickness: 0.025,
				strength: 10
			}
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

		//
		// Get the intial viewport settings prepared.
		Demo.renderer.core.viewport.set(0, 0, 0.15); // The buffer can't really be any larger than world.buffer, guess I could protect against that.
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
		baseRed.update(elapsedTime);
	};

	// ------------------------------------------------------------------
	//
	// This function renders the demo model.
	//
	// ------------------------------------------------------------------
	that.render = function(renderer, elapsedTime) {

		renderer.TiledImage.render(background, renderer.core.viewport);
		renderer.Base.render(baseRed, elapsedTime);
		renderer.SpaceShip.render(spaceShip);
	};

	return that;

}(Demo.input, Demo.components, Demo.assets));
