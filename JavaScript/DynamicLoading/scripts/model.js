// ------------------------------------------------------------------
//
// This namespace holds the dynamic loading demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(components) {
    'use strict';

    let font = '14px Arial, sans-serif';
    let textSingle = components.Text({
            text: 'Single (q/a)',
            font: font,
            fill: 'rgba(255, 0, 0, 1)',
            position: { x: 0.05, y: 0.10 }
        });
    let textContinuous = components.Text({
            text: 'Continuous (w/s)',
            font: font,
            fill: 'rgba(0, 255, 0, 1)',
            position: { x: 0, y: 0.10 }
        });
    let textRepeatInterval = components.Text({
            text: 'Repeat Interval (e/d)',
            font: font,
            fill: 'rgba(100, 100, 255, 1)',
            position: { x: 0, y: 0.10 }
        });
    let that = {};

    // ------------------------------------------------------------------
    //
    // When a resize event occurs, remeasure where things should go.
    //
    // ------------------------------------------------------------------
    function notifyResize(updateY) {
        let textSpacing = {
            text: '     ',
            font: textSingle.font
        };
        //
        // Figure out the positioning of the text elements
        textSpacing.width = Demo.renderer.core.measureTextWidth(textSpacing);
        textSpacing.height = Demo.renderer.core.measureTextHeight(textSpacing);

        if (updateY) {
            textSingle.position.y = textSpacing.height * 2;
            textContinuous.position.y = textSpacing.height * 2;
            textRepeatInterval.position.y = textSpacing.height * 2;
        }

        textSingle.height = Demo.renderer.core.measureTextHeight(textSingle);
        textContinuous.height = Demo.renderer.core.measureTextHeight(textContinuous);
        textRepeatInterval.height = Demo.renderer.core.measureTextHeight(textRepeatInterval);

        textSingle.width = Demo.renderer.core.measureTextWidth(textSingle);
        textContinuous.width = Demo.renderer.core.measureTextWidth(textContinuous);
        textRepeatInterval.width = Demo.renderer.core.measureTextWidth(textRepeatInterval);

        textContinuous.position.x = textSingle.position.x + textSingle.width + textSpacing.width;
        textRepeatInterval.position.x = textContinuous.position.x + textContinuous.width + textSpacing.width;
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

    that.moveSingleDown = function(effect) {
        effect.play();
        textSingle.position.y += textSingle.height;    // height world units per keypress
        textSingle.position.y = Math.min(textSingle.position.y, 1.0 - textSingle.height * 2);
    };
    that.moveSingleUp = function(effect) {
        effect.play();
        textSingle.position.y -= textSingle.height;    // height world units per keypress
        textSingle.position.y = Math.max(textSingle.position.y, textSingle.height * 2);
    };

    that.moveRepeatDown = function(effect, elapsedTime) {
        effect.play();
        textContinuous.position.y += (0.2 / 1000) * elapsedTime; // 0.2 world units per second
        textContinuous.position.y = Math.min(textContinuous.position.y, 1.0 - textContinuous.height * 2);
    };
    that.moveRepeatUp = function(effect, elapsedTime) {
        effect.play();
        textContinuous.position.y -= (0.2 / 1000) * elapsedTime; // 0.2 world units per second
        textContinuous.position.y = Math.max(textContinuous.position.y, textContinuous.height * 2);
    };

    that.moveRepeatTimedDown = function(effect) {
        effect.play();
        textRepeatInterval.position.y += textRepeatInterval.height;    // height world units per notification
        textRepeatInterval.position.y = Math.min(textRepeatInterval.position.y, 1.0 - textRepeatInterval.height * 2);
    };
    that.moveRepeatTimedUp = function(effect) {
        effect.play();
        textRepeatInterval.position.y -= textRepeatInterval.height;    // height world units per notification
        textRepeatInterval.position.y = Math.max(textRepeatInterval.position.y, textRepeatInterval.height * 2);
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
        // Draw a border around the unit world.
        renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);

        //
        // Render the incredibly interesting text objects
        renderer.Text.render(textSingle);
        renderer.Text.render(textContinuous);
        renderer.Text.render(textRepeatInterval);
    };

    return that;

}(Demo.components));
