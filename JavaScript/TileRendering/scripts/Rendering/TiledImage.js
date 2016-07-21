/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for a /Components/TiledImage object.
//
// ------------------------------------------------------------------
Demo.renderer.TiledImage = (function(core) {
	'use strict';
	var that = {};

	// ------------------------------------------------------------------
	//
	// Renders a TiledImage model.
	//
	// ------------------------------------------------------------------
	that.render = function(image) {

		//
		// Figure out which is the upper left tile to start rendering from
		var tileWorldCoords = image.size.width * ((image.tileSize / image.pixel.width) * image.viewport.width);
		var tileLeft = Math.floor(image.viewport.left / tileWorldCoords);
		var tileTop = Math.floor(image.viewport.top / tileWorldCoords);
		

		console.log('tile: ' + tileWorldCoords);
		console.log('left: ' + tileLeft);
		console.log('top: ' + tileTop);

		core.drawImage(
			Demo.assets['background-000'],
			0, 0,
			1 / 3, 1 / 3);

		core.drawImage(
			Demo.assets['background-001'],
			1/3, 0,
			1 / 3, 1 / 3);

		core.drawImage(
			Demo.assets['background-002'],
			2/3, 0,
			1 / 3, 1 / 3);

	};

	return that;
}(Demo.renderer.core));
