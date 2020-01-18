//------------------------------------------------------------------
//
// Draws a blue background for the whole game-play area.
//
//------------------------------------------------------------------
Demo.render.background = function (graphics) {
    'use strict';

    graphics.core.drawSquare({ x: 0, y: 0 }, 1, 'rgb(0, 0, 255)');
};
