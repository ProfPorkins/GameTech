// ------------------------------------------------------------------
//
// This namespace holds the rotate to point demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components, assets) {
    'use strict';
    let background = null;
    let spaceShip = null;
    let myKeyboard = input.Keyboard();
    let that = {};

    // ------------------------------------------------------------------
    //
    // Handles movement of the spaceship over the background.  As the ship
    // approaches one of the imaginary boundaries of the visible area, the
    // background is moved around the ship, rather than moving the ship.
    //
    // ------------------------------------------------------------------
    function moveForward(elapsedTime) {
        let proposedCenter = spaceShip.proposedMove(elapsedTime),
            shipCenter = {
                x: proposedCenter.x,
                y: proposedCenter.y
            };

        if (proposedCenter.x >= 0.8 || proposedCenter.x <= 0.2) {
            let vector = {
                x: Math.cos(spaceShip.rotation + spaceShip.orientation) * spaceShip.moveRate * elapsedTime,
                y: 0
            };
            background.move(vector);
            shipCenter.x = (proposedCenter.x >= 0.8) ? 0.8 : 0.2;
        }
        if (proposedCenter.y >= 0.8 || proposedCenter.y <= 0.2) {
            let vector = {
                x: 0,
                y: Math.sin(spaceShip.rotation + spaceShip.orientation) * spaceShip.moveRate * elapsedTime,
            };
            background.move(vector);
            shipCenter.y = (proposedCenter.y >= 0.8) ? 0.8 : 0.2;
        }

        spaceShip.center.x = shipCenter.x;
        spaceShip.center.y = shipCenter.y;
    }

    // ------------------------------------------------------------------
    //
    // This function initializes the model.
    //
    // ------------------------------------------------------------------
    that.initialize = function() {
        //
        // Define the TiledImage model we'll be using for our background.
        // Note: 'size' must be a factor of 'tileSize' and the 'pixel' size
        // of the image.  For example, if the width of the image in pixels is
        // 1280 x 768, then 'size.width' multiplied by 'tileSize' would equal
        // 1280, and 'size.height' multiplied by 'tileSize' would equal 768.  The
        // values for 'size' may also be any value divided by 2, 4, 6, 8, ...
        //
        // [1, 2, 4, 6, 8, ...] = (pixel.width / size.width) * tileSize
        // [1, 2, 4, 6, 8, ...] = (pixel.height / size.height) * tileSize
        //
        let backgroundKey = 'background';
        background = components.TiledImage({
            pixel: { width: assets[backgroundKey].width, height: assets[backgroundKey].height },
            size: { width: 4.375, height: 2.5 },
            tileSize: assets[backgroundKey].tileSize,
            assetKey: backgroundKey
        });

        background.setViewport(0.00, 0.00);

        //
        // Get our spaceship model and renderer created
        spaceShip = components.SpaceShip({
            size: { width: 0.08, height: 0.08 },
            center: { x: 0.5, y: 0.5 },
            rotation: 0,
            moveRate: 0.4 / 1000,        // World units per second
            rotateRate: Math.PI / 1000    // Radians per second
        });

        myKeyboard.registerHandler(function(elapsedTime) {
            moveForward(elapsedTime);
        },
            'w', true
        );

        myKeyboard.registerHandler(function(elapsedTime) {
            spaceShip.rotateLeft(elapsedTime);
        },
            'a', true
        );

        myKeyboard.registerHandler(function(elapsedTime) {
            spaceShip.rotateRight(elapsedTime);
        },
            'd', true
        );
    };

    // ------------------------------------------------------------------
    //
    // Process all input for the model here.
    //
    // ------------------------------------------------------------------
    that.processInput = function(elapsedTime) {
        myKeyboard.update(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // This function is used to update the state of the demo model.
    //
    // ------------------------------------------------------------------
    that.update = function(elapsedTime) {
        spaceShip.update(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // This function renders the demo model.
    //
    // ------------------------------------------------------------------
    that.render = function(renderer) {
        renderer.TiledImage.render(background);
        renderer.SpaceShip.render(spaceShip);

        //
        // Draw a border around the unit world.
        renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);
    };

    return that;

}(Demo.input, Demo.components, Demo.assets));
