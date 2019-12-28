// ------------------------------------------------------------------
//
// This namespace holds the custom font demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(components) {
    'use strict';

    let textSmall = components.Text({
            text: 'Small Text',
            font: '12px KenVector Future',
            fill: 'rgba(255, 0, 0, 1)',
            position: { x: 0.0, y: 0.00 }
        });
    let textMedium = components.Text({
            text: 'Medium Text',
            font: '20px KenVector Future',
            fill: 'rgba(0, 255, 0, 1)',
            position: { x: 0.0, y: 0.00 }
        });
    let textLarge = components.Text({
            text: 'Large Text',
            font: '36px KenVector Future',
            fill: 'rgba(100, 100, 255, 1)',
            position: { x: 0.0, y: 0.00 }
        });
    let that = {};

    // ------------------------------------------------------------------
    //
    // When a resize event occurs, remeasure where things should go.
    //
    // ------------------------------------------------------------------
    function notifyResize() {
        let totalHeight = 0;

        //
        // Place all the text items in the center (horizontally) of the screen.
        textSmall.height = Demo.renderer.core.measureTextHeight(textSmall);
        textMedium.height = Demo.renderer.core.measureTextHeight(textMedium);
        textLarge.height = Demo.renderer.core.measureTextHeight(textLarge);

        textSmall.width = Demo.renderer.core.measureTextWidth(textSmall);
        textMedium.width = Demo.renderer.core.measureTextWidth(textMedium);
        textLarge.width = Demo.renderer.core.measureTextWidth(textLarge);

        //
        // Figure out where to start vertically so we center all of the text vertically.
        totalHeight = textSmall.height + textMedium.height + textLarge.height;

        textSmall.position.x = (0.5 - textSmall.width / 2.0);
        textSmall.position.y = 0.5 - totalHeight / 2.0 + textSmall.height;

        textMedium.position.x = (0.5 - textMedium.width / 2.0);
        textMedium.position.y = textSmall.position.y + textSmall.height;

        textLarge.position.x = (0.5 - textLarge.width / 2.0);
        textLarge.position.y = textMedium.position.y + textMedium.height;
    }

    // ------------------------------------------------------------------
    //
    // This function initializes the input demo model.  Only thing it
    // does right now is to register the resize event with the renderer.
    //
    // ------------------------------------------------------------------
    that.initialize = function() {
        Demo.renderer.core.notifyResize(notifyResize);
        notifyResize(true);
    };

    // ------------------------------------------------------------------
    //
    // This function is used to update the state of the demo model.
    //
    // ------------------------------------------------------------------
    that.update = function() {
        //
        // We don't have anything to do!
    };

    // ------------------------------------------------------------------
    //
    // This function renders the demo model.
    //
    // ------------------------------------------------------------------
    that.render = function(renderer) {
        //
        // Render the incredibly interesting text objects
        renderer.Text.render(textSmall);
        renderer.Text.render(textMedium);
        renderer.Text.render(textLarge);

        //
        // Draw a border around the unit world.
        renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);
    };

    return that;

}(Demo.components));
