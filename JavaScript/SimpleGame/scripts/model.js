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
			get width() { return 4.375; },
			get height() { return 2.5; },
			get bufferSize() { return 0.25; }
		},
		worldBuffer = {
			get left() { return world.left + world.bufferSize; },
			get top() { return world.top + world.bufferSize; },
			get right() { return world.width - world.bufferSize; },
			get bottom() { return world.height - world.bufferSize; }
		},
		background = null,
		spaceShip = null,	// Spaceship is speshul because we keep the viewport oriented based on its location
		spaceShipHandlerIds = undefined,
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
	// Unregister the various keyboard events from the spaceship.  But, have
	// to admit, it is kind of funny to be able to keep pressing these after
	// the spaceship has died.
	//
	// ------------------------------------------------------------------
	function unregisterSpaceShipKeyboard(handlerIds) {
		var item,
			entry;

		for (var item in handlerIds) {
			if (handlerIds.hasOwnProperty(item)) {
				entry = handlerIds[item];
				myKeyboard.unregisterHandler(entry.key, entry.handlerId);
			}
		}
	}

	// ------------------------------------------------------------------
	//
	// Register the various keyboard events we need for the spaceship.  While
	// doing so, collect the handler id's so they can be unregistered at
	// a later time, such as when the spaceship dies.
	//
	// ------------------------------------------------------------------
	function registerSpaceShipKeyboard(ship) {
		var handlerIds = [],
			handlerId;

		handlerId = myKeyboard.registerHandler(function(elapsedTime) {
			ship.accelerate(elapsedTime);
		}, input.KeyEvent.DOM_VK_W, true);
		handlerIds.push({ key: input.KeyEvent.DOM_VK_W, handlerId: handlerId });

		handlerId = myKeyboard.registerHandler(function(elapsedTime) {
			ship.rotateLeft(elapsedTime);
		}, input.KeyEvent.DOM_VK_A, true);
		handlerIds.push({ key: input.KeyEvent.DOM_VK_A, handlerId: handlerId });

		handlerId = myKeyboard.registerHandler(function(elapsedTime) {
			ship.rotateRight(elapsedTime);
		}, input.KeyEvent.DOM_VK_D, true);
		handlerIds.push({ key: input.KeyEvent.DOM_VK_D, handlerId: handlerId });

		handlerId = myKeyboard.registerHandler(function(elapsedTime) {
			ship.fire(function(entity, renderer) {
				friendlyEntities[nextEntityId++] = {
					model: entity,
					renderer: renderer
				};
			});
		}, input.KeyEvent.DOM_VK_SPACE, false);
		handlerIds.push({ key: input.KeyEvent.DOM_VK_SPACE, handlerId: handlerId });

		//
		// Register keyboard handlers to cause a thrust sound to occur
		handlerId = myKeyboard.registerHandlerDown(function() {
			ship.startAccelerate();
		}, input.KeyEvent.DOM_VK_W);
		handlerIds.push({ key: input.KeyEvent.DOM_VK_W, handlerId: handlerId });

		handlerId = myKeyboard.registerHandlerUp(function() {
			ship.endAccelerate();
		}, input.KeyEvent.DOM_VK_W);
		handlerIds.push({ key: input.KeyEvent.DOM_VK_W, handlerId: handlerId });

		return handlerIds;
	}

	// ------------------------------------------------------------------
	//
	// Create the different enemy bases the player must destroy.
	//
	// ------------------------------------------------------------------
	function initializeEnemyBases() {
		var base = undefined;

		base = components.Base({
			imageName: 'base-red',
			center: { x: world.left + 0.75, y: world.top + 0.75 },
			radius: 0.10,
			rotation: 0,
			rotateRate: (Math.PI / 4) / 1000,	// Slow rotation
			vicinity: 0.40,
			missile: {
				delay: 500,
				lifetime: 5000,
				rotateRate: Math.PI / 4000
			},
			hitPoints: {
				max: 5
			},
			shield: {
				regenerationDelay: 1000,
				thickness: 0.025,
				max: 10
			}
		});
		enemyEntities[nextEntityId++] = {
			model: base,
			renderer: renderer.Base
		};

		base = components.Base({
			imageName: 'base-green',
			center: { x: world.width - 0.75, y: world.top + 0.75 },
			radius: 0.15,
			rotation: 0,
			rotateRate: (Math.PI / 4) / 1000,	// Slow rotation
			vicinity: 0.50,
			missile: {
				delay: 400,
				lifetime: 6000,
				rotateRate: Math.PI / 3000
			},
			hitPoints: {
				max: 5
			},
			shield: {
				regenerationDelay: 800,
				thickness: 0.025,
				max: 10
			}
		});
		enemyEntities[nextEntityId++] = {
			model: base,
			renderer: renderer.Base
		};

		base = components.Base({
			imageName: 'base-blue',
			center: { x: world.width / 2, y: world.height / 2 },
			radius: 0.05,
			rotation: 0,
			rotateRate: (Math.PI / 4) / 1000,	// Slow rotation
			vicinity: 0.50,
			missile: {
				delay: 400,
				lifetime: 7000,
				rotateRate: Math.PI / 2000
			},
			hitPoints: {
				max: 5
			},
			shield: {
				regenerationDelay: 500,
				thickness: 0.025,
				max: 10
			}
		});
		enemyEntities[nextEntityId++] = {
			model: base,
			renderer: renderer.Base
		};

		base = components.Base({
			imageName: 'base-yellow',
			center: { x: world.left + 0.667 * world.width , y: world.height - 1.0 },
			radius: 0.20,
			rotation: 0,
			rotateRate: (Math.PI / 4) / 2000,	// Slow rotation
			vicinity: 1.00,
			missile: {
				delay: 1000,
				lifetime: 7000,
				rotateRate: Math.PI / 2000
			},
			hitPoints: {
				max: 25
			},
			shield: {
				regenerationDelay: 1000,
				thickness: 0.03,
				max: 10
			}
		});
		enemyEntities[nextEntityId++] = {
			model: base,
			renderer: renderer.Base
		};
	}

	// ------------------------------------------------------------------
	//
	// This function initializes the model.
	//
	// ------------------------------------------------------------------
	that.initialize = function() {
		var backgroundKey = 'background';

		//
		// Get the intial viewport settings prepared.
		Demo.renderer.core.viewport.set(0, 0, 0.25); // The buffer can't really be any larger than world.buffer, guess I could protect against that.

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
			rotateRate: Math.PI / 1000,			// Radians per millisecond
			hitPoints: {
				max: 10
			}
		});
		friendlyEntities[nextEntityId++] = {
			model: spaceShip,
			renderer: renderer.SpaceShip
		};
		spaceShip.registerDeathHanlder(function() {
			unregisterSpaceShipKeyboard(spaceShipHandlerIds);
		});
		spaceShipHandlerIds = registerSpaceShipKeyboard(spaceShip);

		initializeEnemyBases();

		//
		// Start the background music.
		Demo.assets['audio-music-background'].loop = true;
		Demo.assets['audio-music-background'].volume = 0.5;
		Demo.assets['audio-music-background'].play();
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
					if (entity.intersects(test)) {
						if (!test.collide(entity)) {
							delete others[testId];
						}
						keepAlive = keepAlive && entity.collide(test);
					} else {
						//
						// Check for vicinity if an intersection didn't occur
						entity.vicinity(test, function(entity, renderer) {
							enemyEntities[nextEntityId++] = {
								model: entity,
								renderer: renderer
							}
						});
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
