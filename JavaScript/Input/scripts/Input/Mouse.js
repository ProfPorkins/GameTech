/* global Demo */

// ------------------------------------------------------------------
//
// Input handling support
//
// ------------------------------------------------------------------
Demo.input.Mouse = function() {
	'use strict';
	var that = {
		mouseDown : [],
		mouseUp : [],
		mouseMove : [],
		handlersDown : [],
		handlersUp : [],
		handlersMove : []
	};

	function mouseDown(event) {
		that.mouseDown.push(event);
	}

	function mouseUp(event) {
		that.mouseUp.push(event);
	}

	function mouseMove(event) {
		that.mouseMove.push(event);
	}

	that.update = function(elapsedTime) {
		var event,
			handler;
		//
		// Process the mouse events for each of the different kinds of handlers
		for (event = 0; event < that.mouseDown.length; event += 1) {
			for (handler = 0; handler < that.handlersDown.length; handler += 1) {
				that.handlersDown[handler](that.mouseDown[event], elapsedTime);
			}
		}

		for (event = 0; event < that.mouseUp.length; event += 1) {
			for (handler = 0; handler < that.handlersUp.length; handler += 1) {
				that.handlersUp[handler](that.mouseUp[event], elapsedTime);
			}
		}

		for (event = 0; event < that.mouseMove.length; event += 1) {
			for (handler = 0; handler < that.handlersMove.length; handler += 1) {
				that.handlersMove[handler](that.mouseMove[event], elapsedTime);
			}
		}

		//
		// Now that we have processed all the inputs, reset everything back to the empty state
		that.mouseDown.length = 0;
		that.mouseUp.length = 0;
		that.mouseMove.length = 0;
	};

	that.registerCommand = function(type, handler) {
		if (type === 'mousedown') {
			that.handlersDown.push(handler);
		} else if (type === 'mouseup') {
			that.handlersUp.push(handler);
		} else if (type === 'mousemove') {
			that.handlersMove.push(handler);
		}
	};

	window.addEventListener('mousedown', mouseDown);
	window.addEventListener('mouseup', mouseUp);
	window.addEventListener('mousemove', mouseMove);

	return that;
};
