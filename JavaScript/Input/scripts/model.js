/* global Demo, Random */
// ------------------------------------------------------------------
//
// This namespace holds the input demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(components) {
	'use strict';

	var textObjects = {
			text : '',
			font : '16px Arial, sans-serif',
			fill : 'rgba(200, 200, 255, 1)',
			pos : { x : 1.025, y : 0.10 }
		},
		that = { };

	// ------------------------------------------------------------------
	//
	// When a resize event occurs, remeasure where things should go.
	//
	// ------------------------------------------------------------------
	function notifyResize() {
		//
		// Figure out the positioning of the text elements
		textObjects.height = Demo.renderer.core.measureTextHeight(textObjects);
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
		// Show some stats about the demo
		textObjects.text = 'objects: ' + 0;
		renderer.core.drawText(textObjects);
	};

	return that;

}(Demo.components));
