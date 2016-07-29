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
			momentum: { x: 0.0, y: 0.0 },		// World units per millisecond
			maxSpeed: 0.0004,					// World units per millisecond
			rotation: 0,
			accelerationRate: 0.0004 / 1000,	// World units per second
			rotateRate: Math.PI / 1000			// Radians per second
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
			spaceShip.accelerate(elapsedTime);
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
	// A moveable entity requires extra care because it can't be allowed to go
	// outside of the game-world boundaries.
	//
	// ------------------------------------------------------------------
	function updateMovableEntity(entity, elapsedTime) {
		entity.update(elapsedTime);

		if (entity.center.x >= (world.width - world.buffer) || entity.center.x <= (world.left + world.buffer)) {
			entity.center.x = (entity.center.x >= (world.width - world.buffer)) ? (world.width - world.buffer) : (world.left + world.buffer);
			//
			// Also stop any motion in the x direction.
			entity.momentum.x = 0;
		}
		if (entity.center.y >= (world.height - world.buffer) || entity.center.y <= (world.top + world.buffer)) {
			entity.center.y = (entity.center.y >= (world.height - world.buffer)) ? (world.height - world.buffer) : (world.top + world.buffer);
			//
			// Also stop any motion in the y direction.
			entity.momentum.y = 0;
		}
	}

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
		updateMovableEntity(spaceShip, elapsedTime);
		//
		//
		baseRed.update(elapsedTime);
		//
		// Keep the viewport oriented with respect to the space ship.
		Demo.renderer.core.viewport.update(spaceShip);
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
