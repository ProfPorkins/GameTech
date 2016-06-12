/* global QuadTreeDemo */
// ------------------------------------------------------------------
//
// This namespace provides the simulation loop for the quad-tree demo.
//
// ------------------------------------------------------------------
QuadTreeDemo.main = (function(renderer, model) {
	'use strict';
	var lastTimeStamp = performance.now();

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
	function render() {
		renderer.clearCanvas();
		model.render(QuadTreeDemo.renderer);
	}

	//------------------------------------------------------------------
	//
	// A game loop so we can show some animation with this demo.
	//
	//------------------------------------------------------------------
	function gameLoop(time) {
		var elapsedTime = (time - lastTimeStamp);
		lastTimeStamp = time;

		update(elapsedTime);
		render();

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
		renderer.initialize();
		model.initialize();
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

}(QuadTreeDemo.renderer, QuadTreeDemo.model));
