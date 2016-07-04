/* global Demo, Random */
// ------------------------------------------------------------------
//
// This namespace holds the input demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(components) {
	'use strict';

	var textSingle = components.Text({
			text: 'Single',
			font: '16px Arial, sans-serif',
			fill: 'rgba(255, 0, 0, 1)',
			position: { x: 0.05, y: 0.10 }
		}),
		textRepeat = components.Text({
			text: 'Repeating',
			font: '16px Arial, sans-serif',
			fill: 'rgba(0, 255, 0, 1)',
			position: { x: 0, y: 0.10 }
		}),
		textRepeatTimed = components.Text({
			text: 'Timed Repeat',
			font: '16px Arial, sans-serif',
			fill: 'rgba(0, 0, 255, 1)',
			position: { x: 0, y: 0.10 }
		}),
		that = {};

	// ------------------------------------------------------------------
	//
	// When a resize event occurs, remeasure where things should go.
	//
	// ------------------------------------------------------------------
	function notifyResize() {
		var textSpacing = {
			text: '     ',
			font: textSingle.font
		};
		//
		// Figure out the positioning of the text elements
		textSpacing.width = Demo.renderer.core.measureTextWidth(textSpacing);

		textSingle.height = Demo.renderer.core.measureTextHeight(textSingle);
		textRepeat.height = Demo.renderer.core.measureTextHeight(textRepeat);
		textRepeatTimed.height = Demo.renderer.core.measureTextHeight(textRepeatTimed);

		textSingle.width = Demo.renderer.core.measureTextWidth(textSingle);
		textRepeat.width = Demo.renderer.core.measureTextWidth(textRepeat);
		textRepeatTimed.width = Demo.renderer.core.measureTextWidth(textRepeatTimed);

		textRepeat.position.x = textSingle.position.x + textSingle.width + textSpacing.width;
		textRepeatTimed.position.x = textRepeat.position.x + textRepeat.width + textSpacing.width;
	}

	// ------------------------------------------------------------------
	//
	// This function initializes the quad-tree demo model.  Only thing it
	// does right now is to add the circles to the model.
	//
	// ------------------------------------------------------------------
	that.initialize = function() {

		Demo.renderer.core.notifyResize(notifyResize);
	};

	that.moveSingleDown = function() {
		textSingle.position.y += textSingle.height;	// height world units per keypress
	};
	that.moveSingleUp = function() {
		textSingle.position.y -= textSingle.height;	// height world units per keypress
	};

	that.moveRepeatDown = function(elapsedTime) {
		textRepeat.position.y += (0.2 / 1000) * elapsedTime; // 0.2 world units per second
	};
	that.moveRepeatUp = function(elapsedTime) {
		textRepeat.position.y -= (0.2 / 1000) * elapsedTime; // 0.2 world units per second
	};

	that.moveRepeatTimedDown = function() {
		textRepeatTimed.position.y += textRepeatTimed.height;	// height world units per notification
	};
	that.moveRepeatTimedUp = function() {
		textRepeatTimed.position.y -= textRepeatTimed.height;	// height world units per notification
	};

	// ------------------------------------------------------------------
	//
	// This function is used to update the state of the demo model.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {

	};

	// ------------------------------------------------------------------
	//
	// This function renders the demo model.
	//
	// ------------------------------------------------------------------
	that.render = function(renderer) {

		//
		// Draw a border around the unit world.
		renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);

		//
		// Render the incredibly interesting text objects
		renderer.Text.render(textSingle);
		renderer.Text.render(textRepeat);
		renderer.Text.render(textRepeatTimed);
	};

	return that;

}(Demo.components));
