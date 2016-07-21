/* global Demo */

//------------------------------------------------------------------
//
// Defines a TiledImage component.  A TileImage is a large image composed
// of many tiles, with the tiles used to provide efficient rendering of
// the image because it is much larger than ever viewed at a single time.
//
// The TileImage spec is defined as...
//	{
//		size: { width: , height: },		// In world coordinates
//		pixel: { width: , height: },	// In pixel coordinates
//		tileSize: 						// Size of the source image tiles (ex. 128)
//		assetKey:						// Root asset key to use for the asset tiles
//	}
//
//------------------------------------------------------------------
Demo.components.TiledImage = function(spec) {
	'use strict';
	var viewport = {
			left: 0,
			top: 0,
			width: 1,
			height: 1
		},
		that = {
			get viewport() { return viewport; },
			get tileSize() { return spec.tileSize; },
			get size() { return spec.size; },
			get pixel() { return spec.pixel; },
			get assetKey() { return spec.assetKey; },
			get tilesX() { return spec.pixel.width / tileSize; },
			get tilesY() { return spec.pixel.height / tileSize; }
		};

	that.setViewport = function(left, top, width, height) {
		viewport.left = left;
		viewport.top = top;
		viewport.width = width;
		viewport.height = height;
	};

	that.move = function(distance, vector) {
		viewport.left += (vector.x * distance);
		viewport.top += (vector.y * distance);
	}

	return that;
};
