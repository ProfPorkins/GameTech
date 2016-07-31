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
			get bufferSize() { return 0.15; }
		},
		worldBuffer = {
			get left() { return world.left + world.bufferSize; },
			get top() { return world.top + world.bufferSize; },
			get right() { return world.width - world.bufferSize; },
			get bottom() { return world.height - world.bufferSize; }
		},
		background = null,
		spaceShip = null,	// Spaceship is speshul because we keep the viewport oriented based on its location
		nextEntityId = 0,
		friendlyEntities = {},
		enemyEntities = {},
		myKeyboard = input.Keyboard(),
		that = {};

	//
	// Define properties for the collision buffer used for the world.
	Object.defineProperty(world, 'buffer', {
		get: function() { return worldBuffer },
		enumerable: true,
		configurable: false
	});

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
		friendlyEntities[nextEntityId++] = {
			model: spaceShip,
			renderer: renderer.SpaceShip
		};

		baseRed = components.Base({
			center: { x: 0.75, y: 0.75 },
			radius: 0.10,
			rotation: 0,
			rotateRate: (Math.PI / 4) / 1000,	// Slow rotation
			hitPoints: {
				max: 5
			},
			shield: {
				thickness: 0.025,
				max: 10
			}
		});
		enemyEntities[nextEntityId++] = {
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
				friendlyEntities[nextEntityId++] = {
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
	// This function tells a moveable entity to update itself and then has
	// it check for collisions with various other kinds of things in the game.
	//
	// ------------------------------------------------------------------
	function updateEntity(entity, others, elapsedTime) {
		var keepAlive = entity.update(elapsedTime),
			testId = undefined,
			test = undefined;

		if (keepAlive) {
			//
			// Check for collision with the world boundary
			if (entity.center.x >= world.buffer.right || entity.center.x <= world.buffer.left) {
				entity.center.x = (entity.center.x >= world.buffer.right) ? world.buffer.right : world.buffer.left;
				//
				// Also stop any motion in the x direction.
				entity.momentum.x = 0;
				keepAlive = entity.collide();
			}
			if (entity.center.y >= world.buffer.bottom || entity.center.y <= world.buffer.top) {
				entity.center.y = (entity.center.y >= world.buffer.bottom) ? world.buffer.bottom : world.buffer.top;
				//
				// Also stop any motion in the y direction.
				entity.momentum.y = 0;
				keepAlive = entity.collide();
			}
		}

		//
		// Check for collision with other entities and take action based
		// on those collisions.
		if (keepAlive) {
			for (testId in others) {
				if (others.hasOwnProperty(testId)) {
					test = others[testId].model;
					if (entity !== test && entity.intersects(test)) {
						if (!test.collide(entity)) {
							delete others[testId];
						}
						keepAlive = keepAlive && entity.collide(test);
					}
				}
			}
		}

		return keepAlive;
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
		for (entity in enemyEntities) {
			if (enemyEntities.hasOwnProperty(entity)) {
				if (!updateEntity(enemyEntities[entity].model, friendlyEntities, elapsedTime)) {
					delete enemyEntities[entity];
				}
			}
		}

		for (var entity in friendlyEntities) {
			if (friendlyEntities.hasOwnProperty(entity)) {
				if (!updateEntity(friendlyEntities[entity].model, enemyEntities, elapsedTime)) {
					delete friendlyEntities[entity];
				}
			}
		}

		components.ParticleSystem.update(elapsedTime);

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

		for (entityId in enemyEntities) {
			if (enemyEntities.hasOwnProperty(entityId)) {
				entity = enemyEntities[entityId];
				entity.renderer.render(entity.model, elapsedTime);
			}
		}
		for (entityId in friendlyEntities) {
			if (friendlyEntities.hasOwnProperty(entityId)) {
				entity = friendlyEntities[entityId];
				entity.renderer.render(entity.model, elapsedTime);
			}
		}

		renderer.ParticleSystem.render(components.ParticleSystem);
	};

	return that;

}(Demo.input, Demo.components, Demo.renderer, Demo.assets));
