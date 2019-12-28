//------------------------------------------------------------------
//
// Defines a TiledImage component.  A TileImage is a large image composed
// of many tiles, with the tiles used to provide efficient rendering of
// the image because it is much larger than ever viewed at a single time.
//
// The TileImage spec is defined as...
//    {
//        size: { width: , height: },        // In world coordinates
//        pixel: { width: , height: },    // In pixel coordinates
//        tileSize:                         // Size of the source image tiles (ex. 128)
//        assetKey:                        // Root asset key to use for the asset tiles
//    }
//
// NOTE: 'size' must be a factor of 'tileSize' and the 'pixel' size
// of the image.  For example, if the width of the image in pixels is
// 1280 x 768, then 'size.width' multiplied by 'tileSize' would equal
// 1280, and 'size.height' multiplied by 'tileSize' would equal 768.  The
// values for 'size' may also be any valid value divided by 2, 4, 6, 8, ...
//
// [1, 2, 4, 6, 8, ...] = (pixel.width / size.width) * tileSize
// [1, 2, 4, 6, 8, ...] = (pixel.height / size.height) * tileSize
//
//------------------------------------------------------------------
Demo.components.TiledImage = function(spec) {
    'use strict';
    let viewport = {
            left: 0,
            top: 0
        };
    let that = {
            get viewport() { return viewport; },
            get tileSize() { return spec.tileSize; },
            get size() { return spec.size; },
            get pixel() { return spec.pixel; },
            get assetKey() { return spec.assetKey; },
            get tilesX() { return spec.pixel.width / spec.tileSize; },
            get tilesY() { return spec.pixel.height / spec.tileSize; }
        };

    return that;
};
