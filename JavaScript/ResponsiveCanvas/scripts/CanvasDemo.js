let ResponsiveCanvas = (function() {
    'use strict';
    let canvas = null;
    let context = null;
    let rectangleRotation = 0;
    let lastTimeStamp = performance.now();

    //------------------------------------------------------------------
    //
    // Debugging aid to report some parameters of the canvas and browser window
    //
    //------------------------------------------------------------------
    function reportLayout() {
        console.log('height: ' + canvas.clientHeight);
        console.log('width: ' + canvas.clientWidth);
        console.log('orientation: ' + window.orientation);
    }

    //------------------------------------------------------------------
    //
    // Used to set the size of the canvas to match the size of the browser
    // window so that the rendering stays pixel perfect.
    //
    //------------------------------------------------------------------
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        reportLayout();
    }

    //------------------------------------------------------------------
    //
    // Toggles the full-screen mode.  If not in full-screen, it enters
    // full-screen.  If in full screen, it exits full-screen.
    //
    //------------------------------------------------------------------
    function toggleFullScreen(element) {
        let fullScreenElement = document.fullscreenElement ||
                                document.webkitFullscreenElement ||
                                document.mozFullScreenElement ||
                                document.msFullscreenElement;

        element.requestFullScreen = element.requestFullScreen ||
                                    element.webkitRequestFullscreen ||
                                    element.mozRequestFullScreen ||
                                    element.msRequestFullscreen;
        document.exitFullscreen =    document.exitFullscreen ||
                                    document.webkitExitFullscreen ||
                                    document.mozCancelFullScreen ||
                                    document.msExitFullscreen;

        if (!fullScreenElement && element.requestFullScreen) {
            element.requestFullScreen();
        } else if (fullScreenElement) {
            document.exitFullscreen();
        }
    }

    //------------------------------------------------------------------
    //
    // Clear the whole canvas
    //
    //------------------------------------------------------------------
    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    //------------------------------------------------------------------
    //
    // Draw a border around the canvas.  The reason to start at
    // 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
    // reference: http://stackoverflow.com/questions/7530593/html5-canvas-and-line-width
    //
    //------------------------------------------------------------------
    function drawCanvasBorder() {
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(0, 0, 255, 1)';
        context.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
    }

    //------------------------------------------------------------------
    //
    // Draw a rectangle vertically and horizontally centered in the canvas.
    // Depending upon the layout of the screen, we choose to make the size
    // relative to the width or height.  Intesteringly, this choice isn't made
    // based on orientation because a desktop browser may have a shape different
    // from the screen orientation.
    //
    //------------------------------------------------------------------
    function drawRectangle() {
        let smallestSize;
        let squareSize;
        let cornerTop;
        let cornerLeft;

        context.save();

        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(rectangleRotation);
        context.translate(-(canvas.width / 2), -(canvas.height / 2));

        //
        // Have to figure out where the upper left corner of the square is
        // based on whether the width or height is the largest dimension.
        if (canvas.width < canvas.height) {
            smallestSize = canvas.width;
            squareSize = smallestSize * 0.6;
            cornerLeft = Math.floor(canvas.width * 0.2);
            cornerTop = (canvas.height - squareSize) / 2;
        } else {
            smallestSize = canvas.height;
            squareSize = smallestSize * 0.6;
            cornerTop = Math.floor(canvas.height * 0.2);
            cornerLeft = (canvas.width - squareSize) / 2;
        }

        //
        // 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
        context.strokeStyle = 'rgba(255, 0, 0, 1)';
        context.strokeRect(
            0.5 + cornerLeft,
            0.5 + cornerTop,
            squareSize, squareSize);

        context.restore();
    }

    //------------------------------------------------------------------
    //
    // Update the simulation.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        //
        // Update the rectangle rotation by 1/2 PI radians per second.
        rectangleRotation += (Math.PI / 2 / 1000) * (elapsedTime);
    }

    //------------------------------------------------------------------
    //
    // Render the simulation.
    //
    //------------------------------------------------------------------
    function render() {
        clearCanvas();
        drawCanvasBorder();
        drawRectangle();
    }

    //------------------------------------------------------------------
    //
    // A game loop so we can show some animation with this demo.
    //
    //------------------------------------------------------------------
    function gameLoop(time) {
        let elapsedTime = (time - lastTimeStamp);
        lastTimeStamp = time;

        update(elapsedTime);
        render();

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
        canvas = document.getElementById('canvas-main');
        context = canvas.getContext('2d');

        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', function() {
            resizeCanvas();
        }, false);
        window.addEventListener('deviceorientation', function() {
            resizeCanvas();
        }, false);

        //
        // Force the canvas to resize to the window first time in, otherwise
        // the canvas is a default we don't want.
        resizeCanvas();
        //
        // Get the gameloop started
        requestAnimationFrame(gameLoop);
    }

    //
    // Only expose the ability to initialize and toggle the full screen
    return {
        initialize: initialize,
        toggleFullScreen: toggleFullScreen
    };

}());
