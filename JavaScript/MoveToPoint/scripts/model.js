// ------------------------------------------------------------------
//
// This namespace holds the rotate to point demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components) {
    'use strict';
    let spaceShip = null;
    let myMouse = input.Mouse();
    let myKeyboard = input.Keyboard();
    let that = {};

    // ------------------------------------------------------------------
    //
    // This function initializes the model.
    //
    // ------------------------------------------------------------------
    that.initialize = function() {
        //
        // Get our spaceship model and renderer created
        spaceShip = components.SpaceShip({
            size: { width: 0.08, height: 0.08 },
            center: { x: 0.5, y: 0.5 },
            target: { x: 0.5, y: 0.5 },
            rotation: 0,
            moveRate: 0.2 / 1000,        // World units per second
            rotateRate: Math.PI / 1000    // Radians per second
        });

        //
        // Whenever the mouse is clicked, set this as the target point
        // for the spaceship.
        myMouse.registerHandler(function(event) {
            spaceShip.setTarget(Demo.renderer.core.clientToWorld(event.clientX, event.clientY));
        },
            myMouse.EventMouseDown
        );

        myKeyboard.registerHandler(function(elapsedTime) {
            spaceShip.moveForward(elapsedTime);
        },
            'w', true);
    };

    // ------------------------------------------------------------------
    //
    // Process all input for the model here.
    //
    // ------------------------------------------------------------------
    that.processInput = function(elapsedTime) {
        myMouse.update(elapsedTime);
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
        //
        // Draw a border around the unit world.
        renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);

        renderer.SpaceShip.render(spaceShip);
    };

    return that;

}(Demo.input, Demo.components, Demo.assets));
