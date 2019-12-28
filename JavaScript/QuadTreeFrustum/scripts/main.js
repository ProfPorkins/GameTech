// ------------------------------------------------------------------
//
// This namespace provides the simulation loop for the quad-tree demo.
//
// ------------------------------------------------------------------
Demo.main = (function(renderer, input, model) {
    'use strict';
    let lastTimeStamp = performance.now();
    let frameTimes = [];
    let textFPS = {
            text : 'fps',
            font : '16px Arial, sans-serif',
            fill : 'rgba(255, 255, 255, 1)',
            position : { x : 1.025, y : 0.00 }
        },
        myKeyboard = input.Keyboard();

    //------------------------------------------------------------------
    //
    // Process any captured input.
    //
    //------------------------------------------------------------------
    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    //------------------------------------------------------------------
    //
    // Update the simulation.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        model.update(elapsedTime);
    }

    //------------------------------------------------------------------
    //
    // Render the simulation.
    //
    //------------------------------------------------------------------
    function render(elapsedTime) {
        let averageTime = 0;
        let fps = 0;

        renderer.core.clearCanvas();
        model.render(Demo.renderer);

        //
        // Show FPS over last several frames
        frameTimes.push(elapsedTime);
        if (frameTimes.length > 50) {
            frameTimes = frameTimes.slice(1);
            averageTime = frameTimes.reduce(function(a, b) { return a + b; }) / frameTimes.length;
            //
            // averageTime is in milliseconds, need to convert to seconds for frames per SECOND
            // But also want to preserve 1 digit past the decimal, so multiplying by 10000 first, then
            // truncating, then dividing by 10 to get back to seconds.
            fps = Math.floor((1 / averageTime) * 10000) / 10;
            textFPS.text = 'fps: ' + fps;
            renderer.core.drawText(textFPS);
        }
    }

    //------------------------------------------------------------------
    //
    // A game loop so we can show some animation with this demo.
    //
    //------------------------------------------------------------------
    function gameLoop(time) {
        let elapsedTime = (time - lastTimeStamp);
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render(elapsedTime);

        requestAnimationFrame(gameLoop);
    }

    //------------------------------------------------------------------
    //
    // This is the entry point for the demo.  From here the various event
    // listeners we care about are prepared, along with setting up the
    // canvas for rendering, finally starting the animation loop.
    //
    //------------------------------------------------------------------
    function initialize() {
        renderer.core.initialize();

        textFPS.height = renderer.core.measureTextHeight(textFPS);
        textFPS.width = renderer.core.measureTextWidth(textFPS);

        model.initialize(200);    // Start the demo with a bunch of randomly placed circles.

        //
        // Let's listen to a few keyboard inputs to control the simulation
        myKeyboard.registerHandler(function() {
                model.toggleQuadTreeRendering();
            },
            'q', false
        );
        myKeyboard.registerHandler(function() {
                model.toggleEntityRendering();
            },
            'e', false
        );
        myKeyboard.registerHandler(function() {
                model.toggleEntityMovement();
            },
            'm', false
        );

        myKeyboard.registerHandler(function() {
                model.quadTreeCriteria = model.quadTreeCriteria + 1;
            },
            'ArrowUp', false
        );
        myKeyboard.registerHandler(function() {
                model.quadTreeCriteria = model.quadTreeCriteria - 1;
            },
            'ArrowDown', false
        );
        myKeyboard.registerHandler(function() {
                model.addCircles(10);
            },
            'PageUp', true
        );
        myKeyboard.registerHandler(function() {
                model.removeCircles(10);
            },
            'PageDown', true
        );

        myKeyboard.registerHandler(function(elapsedTime) {
                model.cameraMoveForward(elapsedTime);
            },
            'w', true
        );
        myKeyboard.registerHandler(function(elapsedTime) {
                model.cameraMoveBackward(elapsedTime);
            },
            's', true
        );
        myKeyboard.registerHandler(function(elapsedTime) {
                model.cameraRotateLeft(elapsedTime);
            },
            'a', true
        );
        myKeyboard.registerHandler(function(elapsedTime) {
                model.cameraRotateRight(elapsedTime);
            },
            'd', true
        );
        myKeyboard.registerHandler(function(elapsedTime) {
                model.cameraDecreaseFOV(elapsedTime);
            },
            'j', true
        );
        myKeyboard.registerHandler(function(elapsedTime) {
                model.cameraIncreaseFOV(elapsedTime);
            },
            'l', true
        );
        myKeyboard.registerHandler(function(elapsedTime) {
                model.cameraIncreaseDepth(elapsedTime);
            },
            'i', true
        );
        myKeyboard.registerHandler(function(elapsedTime) {
                model.cameraDecreaseDepth(elapsedTime);
            },
            'k', true
        );

        //
        // Get the gameloop started
        requestAnimationFrame(gameLoop);
    }

    //
    // Expose only the ability to initialize the demo, it handles itself
    // after that.
    return {
        initialize: initialize
    };

}(Demo.renderer, Demo.input, Demo.model));
