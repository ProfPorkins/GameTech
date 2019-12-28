// ------------------------------------------------------------------
//
// This namespace holds the input demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(components) {
    'use strict';

    let font = '14px Arial, sans-serif';
    let textSingle = components.Text({
            text: 'Single',
            font: font,
            fill: 'rgba(255, 0, 0, 1)',
            position: { x: 0.05, y: 0.10 }
        });
    let textContinuous = components.Text({
            text: 'Continuous',
            font: font,
            fill: 'rgba(0, 255, 0, 1)',
            position: { x: 0, y: 0.10 }
        });
    let textRepeatInterval = components.Text({
            text: 'Repeat Interval',
            font: font,
            fill: 'rgba(100, 100, 255, 1)',
            position: { x: 0, y: 0.10 }
        });
    let textToggle = components.Text({
            text: 'Toggle commands (t) ',
            font: font,
            fill: 'rgba(255, 255, 255, 1)',
            position: { x: 0, y: 0.05 }
        });
    let mouseObject = components.Circle({
            center: { x: 0.5, y: 0.5 },
            radius: 0.05
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
            textToggle.position.y = textSpacing.height * 2;
        }

        textSingle.height = Demo.renderer.core.measureTextHeight(textSingle);
        textContinuous.height = Demo.renderer.core.measureTextHeight(textContinuous);
        textRepeatInterval.height = Demo.renderer.core.measureTextHeight(textRepeatInterval);
        textToggle.height = Demo.renderer.core.measureTextHeight(textToggle);

        textSingle.width = Demo.renderer.core.measureTextWidth(textSingle);
        textContinuous.width = Demo.renderer.core.measureTextWidth(textContinuous);
        textRepeatInterval.width = Demo.renderer.core.measureTextWidth(textRepeatInterval);
        textToggle.width = Demo.renderer.core.measureTextWidth(textToggle);


        textContinuous.position.x = textSingle.position.x + textSingle.width + textSpacing.width;
        textRepeatInterval.position.x = textContinuous.position.x + textContinuous.width + textSpacing.width;
        textToggle.position.x = 1.0 - textToggle.width;
    }

    // ------------------------------------------------------------------
    //
    // When the command set changes, this function is called to update
    // the text to show the new keyboard commands.
    //
    // ------------------------------------------------------------------
    that.notifyCommandToggle = function(isLeft) {
        if (isLeft) {
            textSingle.text = 'Single (q/a)';
            textContinuous.text = 'Continuous (w/s)';
            textRepeatInterval.text = 'Repeat Interval (e/d)';
        } else {
            textSingle.text = 'Single (u/j)';
            textContinuous.text = 'Continuous (i/k)';
            textRepeatInterval.text = 'Repeat Interval (o/l)';
        }

        //
        // Call the resize event to get the positions re-computed.
        notifyResize(false);
    };

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

    that.moveSingleDown = function() {
        textSingle.position.y += textSingle.height;    // height world units per keypress
        textSingle.position.y = Math.min(textSingle.position.y, 1.0 - textSingle.height * 2);
    };
    that.moveSingleUp = function() {
        textSingle.position.y -= textSingle.height;    // height world units per keypress
        textSingle.position.y = Math.max(textSingle.position.y, textSingle.height * 2);
    };

    that.moveRepeatDown = function(elapsedTime) {
        textContinuous.position.y += (0.2 / 1000) * elapsedTime; // 0.2 world units per second
        textContinuous.position.y = Math.min(textContinuous.position.y, 1.0 - textContinuous.height * 2);
    };
    that.moveRepeatUp = function(elapsedTime) {
        textContinuous.position.y -= (0.2 / 1000) * elapsedTime; // 0.2 world units per second
        textContinuous.position.y = Math.max(textContinuous.position.y, textContinuous.height * 2);
    };

    that.moveRepeatTimedDown = function() {
        textRepeatInterval.position.y += textRepeatInterval.height;    // height world units per notification
        textRepeatInterval.position.y = Math.min(textRepeatInterval.position.y, 1.0 - textRepeatInterval.height * 2);
    };
    that.moveRepeatTimedUp = function() {
        textRepeatInterval.position.y -= textRepeatInterval.height;    // height world units per notification
        textRepeatInterval.position.y = Math.max(textRepeatInterval.position.y, textRepeatInterval.height * 2);
    };

    that.moveCircleTo = function(event) {
        mouseObject.center.x = event.x;
        mouseObject.center.y = event.y;
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
        renderer.Text.render(textToggle);

        renderer.core.drawCircle('rgba(255, 255, 255, 1)', mouseObject.center, mouseObject.radius);
    };

    return that;

}(Demo.components));
