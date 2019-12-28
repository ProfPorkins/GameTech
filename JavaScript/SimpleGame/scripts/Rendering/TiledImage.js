// ------------------------------------------------------------------
//
// Rendering function for a /Components/TiledImage object.
//
// ------------------------------------------------------------------
Demo.renderer.TiledImage = (function(core) {
    'use strict';
    let that = {};
    const RENDER_POS_EPISILON = 0.00001;

    //------------------------------------------------------------------
    //
    // Zero pad a number, adapted from Stack Overflow.
    // Source: http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
    //
    //------------------------------------------------------------------
    function numberPad(n, p, c) {
        let pad_char = typeof c !== 'undefined' ? c : '0';
        let pad = new Array(1 + p).join(pad_char);

        return (pad + n).slice(-pad.length);
    }

    // ------------------------------------------------------------------
    //
    // Renders a TiledImage model.
    // TODO: This seems far too complex for what needs to be done, will
    // have to come back to this at some point and simplify the logic.
    //
    // ------------------------------------------------------------------
    that.render = function(image, viewport) {
        let tileSizeWorldCoords = image.size.width * (image.tileSize / image.pixel.width);
        let oneOverTileSizeWorld = 1 / tileSizeWorldCoords;    // Combination of DRY and eliminating a bunch of divisions
        let imageWorldXPos = viewport.left;
        let imageWorldYPos = viewport.top;
        let worldXRemain = 1.0;
        let worldYRemain = 1.0;
        let renderPosX = 0.0;
        let renderPosY = 0.0;
        let tileLeft;
        let tileTop;
        let tileAssetName;
        let tileRenderXStart;
        let tileRenderYStart;
        let tileRenderXDist;
        let tileRenderYDist;
        let tileRenderWorldWidth;
        let tileRenderWorldHeight;

        while (worldYRemain > RENDER_POS_EPISILON) {
            tileLeft = Math.floor(imageWorldXPos * oneOverTileSizeWorld);
            tileTop = Math.floor(imageWorldYPos * oneOverTileSizeWorld);

            if (worldXRemain === 1.0) {
                tileRenderXStart = imageWorldXPos * oneOverTileSizeWorld - tileLeft;
            } else {
                tileRenderXStart = 0.0;
            }
            if (worldYRemain === 1.0) {
                tileRenderYStart = imageWorldYPos * oneOverTileSizeWorld - tileTop;
            } else {
                tileRenderYStart = 0.0;
            }
            tileRenderXDist = 1.0 - tileRenderXStart;
            tileRenderYDist = 1.0 - tileRenderYStart;
            tileRenderWorldWidth = tileRenderXDist / oneOverTileSizeWorld;
            tileRenderWorldHeight = tileRenderYDist / oneOverTileSizeWorld;
            if (renderPosX + tileRenderWorldWidth > 1.0) {
                tileRenderWorldWidth = 1.0 - renderPosX;
                tileRenderXDist = tileRenderWorldWidth * oneOverTileSizeWorld;
            }
            if (renderPosY + tileRenderWorldHeight > 1.0) {
                tileRenderWorldHeight = 1.0 - renderPosY;
                tileRenderYDist = tileRenderWorldHeight * oneOverTileSizeWorld;
            }

            tileAssetName = image.assetKey + '-' + numberPad(tileTop * image.tilesX + tileLeft, 4);
            core.drawImage(
                Demo.assets[tileAssetName],
                tileRenderXStart * image.tileSize, tileRenderYStart * image.tileSize,
                tileRenderXDist * image.tileSize, tileRenderYDist * image.tileSize,
                renderPosX, renderPosY,
                tileRenderWorldWidth, tileRenderWorldHeight);

            imageWorldXPos += tileRenderWorldWidth;
            renderPosX += tileRenderWorldWidth;

            //
            // Subtract off how much of the current tile we used, if there isn't any
            // X distance to render, then move down to the next row of tiles.
            worldXRemain -= tileRenderWorldWidth;
            if (worldXRemain <= RENDER_POS_EPISILON) {
                imageWorldYPos += tileRenderWorldHeight;
                renderPosY += tileRenderWorldHeight;
                worldYRemain -= tileRenderWorldHeight;

                imageWorldXPos = viewport.left;
                renderPosX = 0.0;
                worldXRemain = 1.0;
            }
        }
    };

    return that;
}(Demo.renderer.core));
