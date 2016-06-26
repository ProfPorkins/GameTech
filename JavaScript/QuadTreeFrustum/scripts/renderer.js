/* global Demo */
// ------------------------------------------------------------------
//
// This namespace provides the rendering code for the demo.
//
// ------------------------------------------------------------------
Demo.renderer = (function() {
	'use strict';
	var canvas = null,
		context = null;

	//------------------------------------------------------------------
	//
	// Used to set the size of the canvas to match the size of the browser
	// window so that the rendering stays pixel perfect.
	//
	//------------------------------------------------------------------
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	//------------------------------------------------------------------
	//
	// Toggles the full-screen mode.  If not in full-screen, it enters
	// full-screen.  If in full screen, it exits full-screen.
	//
	//------------------------------------------------------------------
	function toggleFullScreen(element) {
		var	fullScreenElement = document.fullscreenElement ||
								document.webkitFullscreenElement ||
								document.mozFullScreenElement ||
								document.msFullscreenElement;

		element.requestFullScreen = element.requestFullScreen ||
									element.webkitRequestFullscreen ||
									element.mozRequestFullScreen ||
									element.msRequestFullscreen;
		document.exitFullscreen =	document.exitFullscreen ||
									document.webkitExitFullscreen ||
									document.mozCancelFullScreen ||
									document.msExitFullscreen;

		if (!fullScreenElement && element.requestFullScreen) {
			element.requestFullScreen();
		} else if (fullScreenElement) {
			document.exitFullscreen();
		}
	}

	//------------------------------------------------------------------
	//
	// Clear the whole canvas to black
	//
	//------------------------------------------------------------------
	function clearCanvas() {
		context.fillStyle = '#000000';
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	//------------------------------------------------------------------
	//
	// This provides initialization of the canvas.  From here the various
	// event listeners we care about are prepared, along with setting up
	// the canvas for rendering.
	//
	//------------------------------------------------------------------
	function initialize() {
		canvas = document.getElementById('canvas-main');
		context = canvas.getContext('2d');

		window.addEventListener('resize', resizeCanvas, false);
		window.addEventListener('orientationchange', function() {
			resizeCanvas();
		}, false);
		window.addEventListener('deviceorientation', function() {
			resizeCanvas();
		}, false);

		//
		// Force the canvas to resize to the window first time in, otherwise
		// the canvas is a default we don't want.
		resizeCanvas();
	}

	//------------------------------------------------------------------
	//
	// Renders the text based on the provided spec.
	//
	//------------------------------------------------------------------
	function drawText(spec) {
		var smallestSize,
			squareSize,
			cornerTop,
			cornerLeft;

		context.save();

		context.font = spec.font;
		context.fillStyle = spec.fill;
		context.textBaseline = 'top';

		//
		// Have to figure out where the upper left corner of the unit world is
		// based on whether the width or height is the largest dimension.
		if (canvas.width < canvas.height) {
			smallestSize = canvas.width;
			squareSize = smallestSize * 0.9;
			cornerLeft = Math.floor(canvas.width * 0.05);
			cornerTop = (canvas.height - squareSize) / 2;
		} else {
			smallestSize = canvas.height;
			squareSize = smallestSize * 0.9;
			cornerTop = Math.floor(canvas.height * 0.05);
			cornerLeft = (canvas.width - squareSize) / 2;
		}

		context.fillText(
			spec.text,
			cornerLeft + spec.pos.x * squareSize,
			cornerTop + spec.pos.y * squareSize);

		context.restore();
	}

	//------------------------------------------------------------------
	//
	// Draw a circle within the unit world.
	//
	//------------------------------------------------------------------
	function drawCircle(style, center, radius) {
		var smallestSize,
			squareSize,
			cornerTop,
			cornerLeft;

		//
		// Have to figure out where the upper left corner of the unit world is
		// based on whether the width or height is the largest dimension.
		if (canvas.width < canvas.height) {
			smallestSize = canvas.width;
			squareSize = smallestSize * 0.9;
			cornerLeft = Math.floor(canvas.width * 0.05);
			cornerTop = (canvas.height - squareSize) / 2;
		} else {
			smallestSize = canvas.height;
			squareSize = smallestSize * 0.9;
			cornerTop = Math.floor(canvas.height * 0.05);
			cornerLeft = (canvas.width - squareSize) / 2;
		}

		//
		// 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
		context.strokeStyle = style;
		context.beginPath();
		context.arc(
			0.5 + cornerLeft + (center.x * squareSize),
			0.5 + cornerTop + (center.y * squareSize),
			radius * squareSize,
			0, 2 * Math.PI);
		context.stroke();
	}

	//------------------------------------------------------------------
	//
	// Draws a rectangle relative to the 'unit world'.
	//
	//------------------------------------------------------------------
	function drawRectangle(style, left, top, width, height) {
		var smallestSize,
			squareSize,
			cornerTop,
			cornerLeft;

		//
		// Have to figure out where the upper left corner of the unit world is
		// based on whether the width or height is the largest dimension.
		if (canvas.width < canvas.height) {
			smallestSize = canvas.width;
			squareSize = smallestSize * 0.9;
			cornerLeft = Math.floor(canvas.width * 0.05);
			cornerTop = (canvas.height - squareSize) / 2;
		} else {
			smallestSize = canvas.height;
			squareSize = smallestSize * 0.9;
			cornerTop = Math.floor(canvas.height * 0.05);
			cornerLeft = (canvas.width - squareSize) / 2;
		}

		//
		// 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
		context.strokeStyle = style;
		context.strokeRect(
			0.5 + cornerLeft + (left * squareSize),
			0.5 + cornerTop + (top * squareSize),
			width * squareSize,
			height * squareSize);
	}

	//
	// Expose only the ability to initialize and toggle the full screen
	return {
		initialize: initialize,
		clearCanvas: clearCanvas,
		toggleFullScreen: toggleFullScreen,
		drawText: drawText,
		drawRectangle: drawRectangle,
		drawCircle: drawCircle
	};

}());
