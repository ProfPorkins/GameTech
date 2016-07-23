/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for a /Components/TiledImage object.
//
// ------------------------------------------------------------------
Demo.renderer.TiledImage = (function(core) {
	'use strict';
	var that = {};

	//------------------------------------------------------------------
	//
	// Zero pad a number, adapted from Stack Overflow.
	// Source: http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
	//
	//------------------------------------------------------------------
	function numberPad(n, p, c) {
		var pad_char = typeof c !== 'undefined' ? c : '0',
			pad = new Array(1 + p).join(pad_char);

		return (pad + n).slice(-pad.length);
	}

	// ------------------------------------------------------------------
	//
	// Renders a TiledImage model.
	//
	// ------------------------------------------------------------------
	that.render = function(image) {

		//
		// Figure out which is the upper left tile to start rendering from
		var tileSizeWorldCoords = image.size.width * (image.tileSize / image.pixel.width);

		var imageWorldXPos = image.viewport.left;
		var imageWorldYPos = image.viewport.top;
		var worldXLeft = 1.0;
		var worldYLeft = 1.0;
		var renderPosX = 0.0;
		var renderPosY = 0.0;
		while (worldYLeft > 0) {
			var tileLeft = Math.floor(imageWorldXPos / tileSizeWorldCoords);
			var tileTop = Math.floor(imageWorldYPos / tileSizeWorldCoords);

			var tileAssetNumber = tileTop * image.tilesX + tileLeft;
			var tileAssetName = 'background-' + numberPad(tileAssetNumber, 3);

			if (worldXLeft === 1.0) {
				var tileRenderXStart = imageWorldXPos - tileLeft;
			} else {
				tileRenderXStart = 0.0;
			}
			if (worldYLeft === 1.0) {
				var tileRenderYStart = imageWorldYPos - tileTop;
			} else {
				tileRenderYStart = 0.0;
			}
			var tileRenderXDist = 1.0 - tileRenderXStart;
			var tileRenderYDist = 1.0 - tileRenderYStart;
			var tileRenderWorldWidth = tileSizeWorldCoords - tileRenderXStart;
			var tileRenderWorldHeight = tileSizeWorldCoords - tileRenderYStart;
			if (renderPosX + tileRenderWorldWidth > 1.0) {
				tileRenderWorldWidth = 1.0 - renderPosX;
				tileRenderXDist = tileRenderWorldWidth;
			}
			if (renderPosY + tileRenderWorldHeight > 1.0) {
				tileRenderWorldHeight = 1.0 - renderPosY;
				tileRenderYDist = tileRenderWorldHeight;
			}

			// console.log('worldXLeft: ' + worldXLeft);
			// console.log('worldYLeft: ' + worldYLeft);
			// console.log('left: ' + tileLeft);
			// console.log('top: ' + tileTop);

			// console.log('tileRenderStart: ' + tileRenderXStart + ', ' + tileRenderYStart);
			// console.log('tileRenderDist: ' + tileRenderXDist + ', ' + tileRenderYDist);
			// console.log('tileRenderWorldWidth/Height: ' + tileRenderWorldWidth + ', ' + tileRenderWorldHeight);
			// console.log('RenderPos: ' + renderPosX + ', ' + renderPosY);
			// console.log('');

			core.drawImage(
				Demo.assets[tileAssetName],
				tileRenderXStart * image.tileSize, tileRenderYStart * image.tileSize,
				tileRenderXDist * image.tileSize, tileRenderYDist * image.tileSize,
				renderPosX, renderPosY,
				tileRenderWorldWidth, tileRenderWorldHeight);

			imageWorldXPos += tileRenderWorldWidth;
			renderPosX += tileRenderWorldWidth;

			//
			// Subtract off how much of the current tile we used
			worldXLeft -= tileRenderWorldWidth;
			if (worldXLeft <= 0.0) {
				imageWorldYPos += tileRenderWorldHeight;
				renderPosY += tileRenderWorldHeight;
				worldYLeft -= tileRenderWorldHeight;

				imageWorldXPos = image.viewport.left;
				renderPosX = 0.0;
				worldXLeft = 1.0;
				//worldYLeft = 0;
			}
		}
	};

	return that;
}(Demo.renderer.core));
