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

		var tileSizeWorldCoords = image.size.width * (image.tileSize / image.pixel.width);

		var imageWorldXPos = image.viewport.left;
		var imageWorldYPos = image.viewport.top;
		var worldXRemain = 1.0;
		var worldYRemain = 1.0;
		var renderPosX = 0.0;
		var renderPosY = 0.0;
		while (worldYRemain > 0) {
			var tileLeft = Math.floor(imageWorldXPos / tileSizeWorldCoords);
			var tileTop = Math.floor(imageWorldYPos / tileSizeWorldCoords);

			var tileAssetNumber = tileTop * image.tilesX + tileLeft;
			var tileAssetName = 'background-' + numberPad(tileAssetNumber, 3);
			if (!Demo.assets[tileAssetName]) {
				console.log('tileAssetName: ' + tileAssetName);
				console.log('not found');
			}

			if (worldXRemain === 1.0) {
				var tileRenderXStart = imageWorldXPos / tileSizeWorldCoords - tileLeft;
			} else {
				tileRenderXStart = 0.0;
			}
			if (worldYRemain === 1.0) {
				var tileRenderYStart = imageWorldYPos / tileSizeWorldCoords - tileTop;
			} else {
				tileRenderYStart = 0.0;
			}
			var tileRenderXDist = 1.0 - tileRenderXStart;
			var tileRenderYDist = 1.0 - tileRenderYStart;
			var tileRenderWorldWidth = tileRenderXDist / (1 / tileSizeWorldCoords);
			var tileRenderWorldHeight = tileRenderYDist / (1 / tileSizeWorldCoords);
			if (renderPosX + tileRenderWorldWidth > 1.0) {
				tileRenderWorldWidth = 1.0 - renderPosX;
				tileRenderXDist = tileRenderWorldWidth / tileSizeWorldCoords;
			}
			if (renderPosY + tileRenderWorldHeight > 1.0) {
				tileRenderWorldHeight = 1.0 - renderPosY;
				tileRenderYDist = tileRenderWorldHeight / tileSizeWorldCoords;
			}

			// console.log('tileSizeWorldCoords: ' + tileSizeWorldCoords);
			// console.log('worldXLeft: ' + worldXRemain);
			// console.log('worldYLeft: ' + worldYRemain);
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
			worldXRemain -= tileRenderWorldWidth;
			if (worldXRemain <= 0.0) {
				imageWorldYPos += tileRenderWorldHeight;
				renderPosY += tileRenderWorldHeight;
				worldYRemain -= tileRenderWorldHeight;

				imageWorldXPos = image.viewport.left;
				renderPosX = 0.0;
				worldXRemain = 1.0;
			}
		}
	};

	return that;
}(Demo.renderer.core));
