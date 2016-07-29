/* global Demo */

// ------------------------------------------------------------------
//
// This namespace holds the rotate to point demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components, renderer, assets) {
	'use strict';
	var world = {	// The size of the world must match the world-size of the background image
			get left() { return 0; },
			get top() { return 0; },
			get width() { return 5; },
			get height() { return 3; },
			get buffer() { return 0.15; }
		},
		background = null,
		spaceShip = null,	// Spaceship is speshul because we keep the viewport oriented based on its location
		nextEntityId = 0,
		moveableEntities = {},
		unmoveableEntities = {},
		myKeyboard = input.Keyboard(),
		that = {};

	// ------------------------------------------------------------------
	//
	// This function initializes the model.
	//
	// ------------------------------------------------------------------
	that.initialize = function() {
		var baseRed = null,
			backgroundKey = 'background';

		//
		// Define the TiledImage model we'll be using for our background.
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
		moveableEntities[nextEntityId++] = {
			model: spaceShip,
			renderer: renderer.SpaceShip
		};

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
		unmoveableEntities[nextEntityId++] = {
			model: baseRed,
			renderer: renderer.Base
		};

		myKeyboard.registerHandler(function(elapsedTime) {
			spaceShip.accelerate(elapsedTime);
		},
			input.KeyEvent.DOM_VK_W, true);

		myKeyboard.registerHandler(function(elapsedTime) {
			spaceShip.rotateLeft(elapsedTime);
		},
			input.KeyEvent.DOM_VK_A, true);

		myKeyboard.registerHandler(function(elapsedTime) {
			spaceShip.rotateRight(elapsedTime);
		},
			input.KeyEvent.DOM_VK_D, true);

		myKeyboard.registerHandler(function(elapsedTime) {
			spaceShip.fire(function(entity, renderer) {
				moveableEntities[nextEntityId++] = {
					model: entity,
					renderer: renderer
				};
			});
		},
			input.KeyEvent.DOM_VK_SPACE, false);

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
		for (entity in unmoveableEntities) {
			if (unmoveableEntities.hasOwnProperty(entity)) {
				unmoveableEntities[entity].model.update(elapsedTime);
			}
		}

		for (var entity in moveableEntities) {
			if (moveableEntities.hasOwnProperty(entity)) {
				updateMovableEntity(moveableEntities[entity].model, elapsedTime);
			}
		}

		//
		// Keep the viewport oriented with respect to the space ship.
		Demo.renderer.core.viewport.update(spaceShip);
	};

	// ------------------------------------------------------------------
	//
	// This function renders the demo model.
	//
	// ------------------------------------------------------------------
	that.render = function(elapsedTime) {
		var entityId = null,
			entity = null;

		renderer.TiledImage.render(background, renderer.core.viewport);

		for (entityId in unmoveableEntities) {
			if (unmoveableEntities.hasOwnProperty(entityId)) {
				entity = unmoveableEntities[entityId];
				entity.renderer.render(entity.model, elapsedTime);
			}
		}
		for (entityId in moveableEntities) {
			if (moveableEntities.hasOwnProperty(entityId)) {
				entity = moveableEntities[entityId];
				entity.renderer.render(entity.model, elapsedTime);
			}
		}
	};

	return that;

}(Demo.input, Demo.components, Demo.renderer, Demo.assets));
