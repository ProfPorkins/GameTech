// ------------------------------------------------------------------
//
// This namespace provides the simulation loop for the quad-tree demo.
//
// ------------------------------------------------------------------
Demo.main = (function(renderer, components, input, model) {
    'use strict';
    let lastTimeStamp = performance.now();
    let frameTimes = [];
    let textFPS = components.Text({
            text : 'fps',
            font : '16px Arial, sans-serif',
            fill : 'rgba(255, 255, 255, 1)',
            position : { x : 1.025, y : 0.00 }
        });
    let myKeyboard = input.Keyboard();
    let myMouse = input.Mouse();
    let inputLeftIds = {};
    let inputRightIds = {};
    let mouseMoveId = 0;
    let inputsLeft = true;    // We start with the left inputs

    //------------------------------------------------------------------
    //
    // Process any captured input.
    //
    //------------------------------------------------------------------
    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
        myMouse.update(elapsedTime);
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
            renderer.Text.render(textFPS);
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
    // Toggle which set of inputs are being used, left or right.
    //
    //------------------------------------------------------------------
    function toggleInput() {
        inputsLeft = !inputsLeft;
        if (inputsLeft) {
            unregisterInputsRight();
            registerInputsLeft();
        } else {
            unregisterInputsLeft();
            registerInputsRight();
        }

        //
        // Need to let the model know of the change so it can update the
        // text displayed for the user.
        model.notifyCommandToggle(inputsLeft);
    }

    //------------------------------------------------------------------
    //
    // Unregisters the right handed keyboard inputs.
    //
    //------------------------------------------------------------------
    function unregisterInputsRight() {
        myKeyboard.unregisterHandler('j', inputRightIds['j']);
        myKeyboard.unregisterHandler('u', inputRightIds['u']);
        myKeyboard.unregisterHandler('k', inputRightIds['k']);
        myKeyboard.unregisterHandler('i', inputRightIds['i']);
        myKeyboard.unregisterHandler('l', inputRightIds['l']);
        myKeyboard.unregisterHandler('o', inputRightIds['o']);
    }

    //------------------------------------------------------------------
    //
    // Unregisters the left handed keyboard inputs...and the mouse move event.
    //
    //------------------------------------------------------------------
    function unregisterInputsLeft() {
        myKeyboard.unregisterHandler('a', inputLeftIds['a']);
        myKeyboard.unregisterHandler('q', inputLeftIds['q']);
        myKeyboard.unregisterHandler('s', inputLeftIds['s']);
        myKeyboard.unregisterHandler('w', inputLeftIds['w']);
        myKeyboard.unregisterHandler('d', inputLeftIds['d']);
        myKeyboard.unregisterHandler('e', inputLeftIds['e']);

        myMouse.unregisterHandler(myMouse.EventMouseMove, mouseMoveId);
    }

    //------------------------------------------------------------------
    //
    // Register the left side keyboard inputs...and the mouse move event.
    //
    //------------------------------------------------------------------
    function registerInputsLeft() {
        inputLeftIds['a'] = myKeyboard.registerHandler(function() {
                model.moveSingleDown();
            },
            'a', false
        );
        inputLeftIds['q'] = myKeyboard.registerHandler(function() {
                model.moveSingleUp();
            },
            'q', false
        );

        inputLeftIds['s'] = myKeyboard.registerHandler(function(elapsedTime) {
                model.moveRepeatDown(elapsedTime);
            },
            's', true
        );
        inputLeftIds['w'] = myKeyboard.registerHandler(function(elapsedTime) {
                model.moveRepeatUp(elapsedTime);
            },
            'w', true
        );

        inputLeftIds['d'] = myKeyboard.registerHandler(function() {
                model.moveRepeatTimedDown();
            },
            'd', true, 250
        );
        inputLeftIds['e'] = myKeyboard.registerHandler(function() {
                model.moveRepeatTimedUp();
            },
            'e', true, 250
        );

        mouseMoveId = myMouse.registerHandler(function(event) {
                model.moveCircleTo(renderer.core.clientToWorld(event.clientX, event.clientY));
            },
            myMouse.EventMouseMove, true
        );
    }

    //------------------------------------------------------------------
    //
    // Register the right side keyboard inputs.
    //
    //------------------------------------------------------------------
    function registerInputsRight() {
        inputRightIds['j'] = myKeyboard.registerHandler(function() {
                model.moveSingleDown();
            },
            'j', false
        );
        inputRightIds['u'] = myKeyboard.registerHandler(function() {
                model.moveSingleUp();
            },
            'u', false
        );

        inputRightIds['k'] = myKeyboard.registerHandler(function(elapsedTime) {
                model.moveRepeatDown(elapsedTime);
            },
            'k', true
        );
        inputRightIds['i'] = myKeyboard.registerHandler(function(elapsedTime) {
                model.moveRepeatUp(elapsedTime);
            },
            'i', true
        );

        inputRightIds['l'] = myKeyboard.registerHandler(function() {
                model.moveRepeatTimedDown();
            },
            'l', true, 250
        );
        inputRightIds['o'] = myKeyboard.registerHandler(function() {
                model.moveRepeatTimedUp();
            },
            'o', true, 250
        );
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

        model.initialize();
        model.notifyCommandToggle(inputsLeft);

        //
        // Start out by listening to the left keyboard inputs.
        registerInputsLeft();
        //
        // Allow the controls to be changed during runtime.
        myKeyboard.registerHandler(toggleInput, 't', false);
        //
        // Register the mouse events
        myMouse.registerHandler(function(event) {
                //
                // The coordinates recieved from the event are in pixel coordinates,
                // we need them in world coordinates to be useful by the rest of
                // the code.
                model.moveCircleTo(renderer.core.clientToWorld(event.clientX, event.clientY));
            },
            myMouse.EventMouseDown
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

}(Demo.renderer, Demo.components, Demo.input, Demo.model));
