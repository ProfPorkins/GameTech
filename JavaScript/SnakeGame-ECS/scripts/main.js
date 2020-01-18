Demo.main = (function(graphics, components, model) {
    'use strict';
    let lastTimeStamp = performance.now();
    let frameTimes = [];
    let textFPS = components.Text({
            text : 'FPS',
            font : '16px Arial, sans-serif',
            fill : 'rgba(255, 255, 255, 1)',
            position : { x : 1.025, y : 0.00 }
        });

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
        graphics.core.clearCanvas();
        graphics.core.saveContext();
        graphics.core.clip();
        graphics.core.restoreContext();

        //
        // Draw a border around the unit world.
        graphics.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);

        //
        // Show FPS over last several frames
        frameTimes.push(elapsedTime);
        if (frameTimes.length > 50) {
            frameTimes = frameTimes.slice(1);
            let averageTime = frameTimes.reduce(function(a, b) { return a + b; }) / frameTimes.length;
            //
            // averageTime is in milliseconds, need to convert to seconds for frames per SECOND
            // But also want to preserve 1 digit past the decimal, so multiplying by 10000 first, then
            // truncating, then dividing by 10 to get back to seconds.
            let fps = Math.floor((1 / averageTime) * 10000) / 10;
            textFPS.text = 'FPS: ' + fps;
            graphics.Text.render(textFPS);
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

        // This is the rendering to provide the game viewport, it has nothing to do
        // with the actual rendering of the game itself.
        render(elapsedTime);
        update(elapsedTime);

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
        graphics.core.initialize();

        textFPS.height = graphics.core.measureTextHeight(textFPS);
        textFPS.width = graphics.core.measureTextWidth(textFPS);

        model.initialize();

        //
        // Get the gameloop started
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize: initialize
    };

}(Demo.graphics, Demo.components, Demo.model));
