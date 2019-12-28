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
    let inputLeftIds = {};

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
    // Register the keyboard inputs.
    //
    //------------------------------------------------------------------
    function registerInputs() {
        inputLeftIds['a'] = myKeyboard.registerHandler(function() {
                model.moveSingleDown(Demo.assets['effect-1']);
            },
            'a', false
        );
        inputLeftIds['q'] = myKeyboard.registerHandler(function() {
                model.moveSingleUp(Demo.assets['effect-1']);
            },
            'q', false
        );

        inputLeftIds['s'] = myKeyboard.registerHandler(function(elapsedTime) {
                model.moveRepeatDown(Demo.assets['effect-2'], elapsedTime);
            },
            's', true
        );
        inputLeftIds['w'] = myKeyboard.registerHandler(function(elapsedTime) {
                model.moveRepeatUp(Demo.assets['effect-2'], elapsedTime);
            },
            'w', true
        );

        inputLeftIds['d'] = myKeyboard.registerHandler(function() {
                model.moveRepeatTimedDown(Demo.assets['effect-3']);
            },
            'd', true, 250
        );
        inputLeftIds['e'] = myKeyboard.registerHandler(function() {
                model.moveRepeatTimedUp(Demo.assets['effect-3']);
            },
            'e', true, 250
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
        registerInputs();

        //
        // Get the gameloop started
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize: initialize
    };

}(Demo.renderer, Demo.components, Demo.input, Demo.model));
