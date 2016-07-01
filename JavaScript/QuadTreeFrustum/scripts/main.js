/* global Demo, KeyEvent */
// ------------------------------------------------------------------
//
// This namespace provides the simulation loop for the quad-tree demo.
//
// ------------------------------------------------------------------
Demo.main = (function(renderer, input, model) {
	'use strict';
	var lastTimeStamp = performance.now(),
		frameTimes = [],
		textFPS = {
			text : 'fps',
			font : '16px Arial, sans-serif',
			fill : 'rgba(255, 255, 255, 1)',
			pos : { x : 1.05, y : 0.05 }
		},
		myKeyboard = input.Keyboard();

	//------------------------------------------------------------------
	//
	// Process any captured input.
	//
	//------------------------------------------------------------------
	function processInput(elapsedTime) {
		myKeyboard.update(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// Update the simulation.
	//
	//------------------------------------------------------------------
	function update(elapsedTime) {
		model.update(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// Render the simulation.
	//
	//------------------------------------------------------------------
	function render(elapsedTime) {
		var averageTime = 0,
			fps = 0;

		renderer.core.clearCanvas();
		model.render(Demo.renderer);

		//
		// Show FPS over last several frames
		frameTimes.push(elapsedTime);
		if (frameTimes.length > 50) {
			frameTimes = frameTimes.slice(1);
			averageTime = frameTimes.reduce(function(a, b) { return a + b; }) / frameTimes.length;
			//
			// averageTime is in milliseconds, need to convert to seconds for frames per SECOND
			// But also want to preserve 1 digit past the decimal, so multiplying by 10000 first, then
			// truncating, then dividing by 10 to get back to seconds.
			fps = Math.floor((1 / averageTime) * 10000) / 10;
			textFPS.text = 'fps: ' + fps;
			renderer.core.drawText(textFPS);
		}
	}

	//------------------------------------------------------------------
	//
	// A game loop so we can show some animation with this demo.
	//
	//------------------------------------------------------------------
	function gameLoop(time) {
		var elapsedTime = (time - lastTimeStamp);
		lastTimeStamp = time;

		processInput(elapsedTime);
		update(elapsedTime);
		render(elapsedTime);

		requestAnimationFrame(gameLoop);
	}

	//------------------------------------------------------------------
	//
	// This is the entry point for the demo.  From here the various event
	// listeners we care about are prepared, along with setting up the
	// canvas for rendering, finally starting the animation loop.
	//
	//------------------------------------------------------------------
	function initialize() {
		renderer.core.initialize();
		model.initialize(200);	// Start the demo with a bunch of randomly placed circles.

		//
		// Let's listen to a few keyboard inputs to control the simulation
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_Q, false, function() {
			model.toggleQuadTreeRendering();
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_E, false, function() {
			model.toggleEntityRendering();
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_M, false, function() {
			model.toggleEntityMovement();
		});


		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_UP, false, function() {
			model.quadTreeCriteria = model.quadTreeCriteria + 1;
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_DOWN, false, function() {
			model.quadTreeCriteria = model.quadTreeCriteria - 1;
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_PAGE_UP, true, function() {
			model.addCircles(10);
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_PAGE_DOWN, true, function() {
			model.removeCircles(10);
		});

		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_W, true, function(elapsedTime) {
			model.cameraMoveForward(elapsedTime);
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_S, true, function(elapsedTime) {
			model.cameraMoveBackward(elapsedTime);
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_A, true, function(elapsedTime) {
			model.cameraRotateLeft(elapsedTime);
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_D, true, function(elapsedTime) {
			model.cameraRotateRight(elapsedTime);
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_J, true, function(elapsedTime) {
			model.cameraDecreaseFOV(elapsedTime);
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_L, true, function(elapsedTime) {
			model.cameraIncreaseFOV(elapsedTime);
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_I, true, function(elapsedTime) {
			model.cameraIncreaseDepth(elapsedTime);
		});
		myKeyboard.registerCommand(input.KeyEvent.DOM_VK_K, true, function(elapsedTime) {
			model.cameraDecreaseDepth(elapsedTime);
		});

		//
		// Get the gameloop started
		requestAnimationFrame(gameLoop);
	}

	//
	// Expose only the ability to initialize the demo, it handles itself
	// after that.
	return {
		initialize: initialize
	};

}(Demo.renderer, Demo.input, Demo.model));
