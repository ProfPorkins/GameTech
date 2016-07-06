/* global Demo */
// ------------------------------------------------------------------
//
// This namespace provides the simulation loop for the quad-tree demo.
//
// ------------------------------------------------------------------
Demo.main = (function(renderer, components, input, model) {
	'use strict';
	var lastTimeStamp = performance.now(),
		frameTimes = [],
		textFPS = components.Text({
			text : 'fps',
			font : '16px Arial, sans-serif',
			fill : 'rgba(255, 255, 255, 1)',
			position : { x : 1.025, y : 0.00 }
		}),
		myKeyboard = input.Keyboard(),
		myMouse = input.Mouse(),
		inputLeftIds = {},
		inputRightIds = {},
		mouseMoveId = 0,
		inputsLeft = true;	// We start with the left inputs

	//------------------------------------------------------------------
	//
	// Process any captured input.
	//
	//------------------------------------------------------------------
	function processInput(elapsedTime) {
		myKeyboard.update(elapsedTime);
		myMouse.update(elapsedTime);
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
			renderer.Text.render(textFPS);
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
	// Toggle which set of inputs are being used, left or right.
	//
	//------------------------------------------------------------------
	function toggleInput() {
		inputsLeft = !inputsLeft;
		if (inputsLeft) {
			unregisterInputsRight();
			registerInputsLeft();
		} else {
			unregisterInputsLeft();
			registerInputsRight();
		}

		//
		// Need to let the model know of the change so it can update the
		// text displayed for the user.
		model.notifyCommandToggle(inputsLeft);
	}

	//------------------------------------------------------------------
	//
	// Unregisters the right handed keyboard inputs.
	//
	//------------------------------------------------------------------
	function unregisterInputsRight() {
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_J, inputRightIds[input.KeyEvent.DOM_VK_J]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_U, inputRightIds[input.KeyEvent.DOM_VK_U]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_K, inputRightIds[input.KeyEvent.DOM_VK_K]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_I, inputRightIds[input.KeyEvent.DOM_VK_I]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_L, inputRightIds[input.KeyEvent.DOM_VK_L]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_O, inputRightIds[input.KeyEvent.DOM_VK_O]);
	}

	//------------------------------------------------------------------
	//
	// Unregisters the left handed keyboard inputs...and the mouse move event.
	//
	//------------------------------------------------------------------
	function unregisterInputsLeft() {
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_A, inputLeftIds[input.KeyEvent.DOM_VK_A]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_Q, inputLeftIds[input.KeyEvent.DOM_VK_Q]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_S, inputLeftIds[input.KeyEvent.DOM_VK_S]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_W, inputLeftIds[input.KeyEvent.DOM_VK_W]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_D, inputLeftIds[input.KeyEvent.DOM_VK_D]);
		myKeyboard.unregisterHandler(input.KeyEvent.DOM_VK_E, inputLeftIds[input.KeyEvent.DOM_VK_E]);

		myMouse.unregisterHandler(myMouse.EventMouseMove, mouseMoveId);
	}

	//------------------------------------------------------------------
	//
	// Register the left side keyboard inputs...and the mouse move event.
	//
	//------------------------------------------------------------------
	function registerInputsLeft() {
		inputLeftIds[input.KeyEvent.DOM_VK_A] = myKeyboard.registerHandler(function() {
				model.moveSingleDown();
			},
			input.KeyEvent.DOM_VK_A, false
		);
		inputLeftIds[input.KeyEvent.DOM_VK_Q] = myKeyboard.registerHandler(function() {
				model.moveSingleUp();
			},
			input.KeyEvent.DOM_VK_Q, false
		);

		inputLeftIds[input.KeyEvent.DOM_VK_S] = myKeyboard.registerHandler(function(elapsedTime) {
				model.moveRepeatDown(elapsedTime);
			},
			input.KeyEvent.DOM_VK_S, true
		);
		inputLeftIds[input.KeyEvent.DOM_VK_W] = myKeyboard.registerHandler(function(elapsedTime) {
				model.moveRepeatUp(elapsedTime);
			},
			input.KeyEvent.DOM_VK_W, true
		);

		inputLeftIds[input.KeyEvent.DOM_VK_D] = myKeyboard.registerHandler(function() {
				model.moveRepeatTimedDown();
			},
			input.KeyEvent.DOM_VK_D, true, 250
		);
		inputLeftIds[input.KeyEvent.DOM_VK_E] = myKeyboard.registerHandler(function() {
				model.moveRepeatTimedUp();
			},
			input.KeyEvent.DOM_VK_E, true, 250
		);

		mouseMoveId = myMouse.registerHandler(function(event) {
				model.moveCircleTo(renderer.core.clientToWorld(event.clientX, event.clientY));
			},
			myMouse.EventMouseMove, true
		);
	}

	//------------------------------------------------------------------
	//
	// Register the right side keyboard inputs.
	//
	//------------------------------------------------------------------
	function registerInputsRight() {
		inputRightIds[input.KeyEvent.DOM_VK_J] = myKeyboard.registerHandler(function() {
				model.moveSingleDown();
			},
			input.KeyEvent.DOM_VK_J, false
		);
		inputRightIds[input.KeyEvent.DOM_VK_U] = myKeyboard.registerHandler(function() {
				model.moveSingleUp();
			},
			input.KeyEvent.DOM_VK_U, false
		);

		inputRightIds[input.KeyEvent.DOM_VK_K] = myKeyboard.registerHandler(function(elapsedTime) {
				model.moveRepeatDown(elapsedTime);
			},
			input.KeyEvent.DOM_VK_K, true
		);
		inputRightIds[input.KeyEvent.DOM_VK_I] = myKeyboard.registerHandler(function(elapsedTime) {
				model.moveRepeatUp(elapsedTime);
			},
			input.KeyEvent.DOM_VK_I, true
		);

		inputRightIds[input.KeyEvent.DOM_VK_L] = myKeyboard.registerHandler(function() {
				model.moveRepeatTimedDown();
			},
			input.KeyEvent.DOM_VK_L, true, 250
		);
		inputRightIds[input.KeyEvent.DOM_VK_O] = myKeyboard.registerHandler(function() {
				model.moveRepeatTimedUp();
			},
			input.KeyEvent.DOM_VK_O, true, 250
		);
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

		textFPS.height = renderer.core.measureTextHeight(textFPS);
		textFPS.width = renderer.core.measureTextWidth(textFPS);

		model.initialize();
		model.notifyCommandToggle(inputsLeft);

		//
		// Start out by listening to the left keyboard inputs.
		registerInputsLeft();
		//
		// Allow the controls to be changed during runtime.
		myKeyboard.registerHandler(toggleInput, input.KeyEvent.DOM_VK_T, false);
		//
		// Register the mouse events
		myMouse.registerHandler(function(event) {
				//
				// The coordinates recieved from the event are in pixel coordinates,
				// we need them in world coordinates to be useful by the rest of
				// the code.
				model.moveCircleTo(renderer.core.clientToWorld(event.clientX, event.clientY));
			},
			myMouse.EventMouseDown
		);

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

}(Demo.renderer, Demo.components, Demo.input, Demo.model));
