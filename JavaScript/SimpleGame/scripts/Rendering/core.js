/* global Demo */

// ------------------------------------------------------------------
//
// This namespace provides the core rendering code for the demo.
//
// ------------------------------------------------------------------
Demo.renderer.core = (function() {
    'use strict';
    let canvas = null;
    let context = null;
    let world = {
            size: 0,
            top: 0,
            left: 0
        };
    let viewport = Demo.components.Viewport({
            left: 0,
            top: 0,
            buffer: 0.15    // This can't really be any larger than world.buffer, guess I could protect against that.
        });
    let resizeHandlers = [];

    //------------------------------------------------------------------
    //
    // Used to set the size of the canvas to match the size of the browser
    // window so that the rendering stays pixel perfect.
    //
    //------------------------------------------------------------------
    function resizeCanvas() {
        let smallestSize = 0;
        let handler = null;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        //
        // Have to figure out where the upper left corner of the unit world is
        // based on whether the width or height is the largest dimension.
        if (canvas.width < canvas.height) {
            smallestSize = canvas.width;
            world.size = smallestSize * 0.9;
            world.left = Math.floor(canvas.width * 0.05);
            world.top = (canvas.height - world.size) / 2;
        } else {
            smallestSize = canvas.height;
            world.size = smallestSize * 0.9;
            world.top = Math.floor(canvas.height * 0.05);
            world.left = (canvas.width - world.size) / 2;
        }

        //
        // Notify interested parties of the canvas resize event.
        for (handler in resizeHandlers) {
            resizeHandlers[handler](true);
        }
    }

    //------------------------------------------------------------------
    //
    // Quick to allow other code to be notified when a resize event occurs.
    //
    //------------------------------------------------------------------
    function notifyResize(handler) {
        resizeHandlers.push(handler);
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
    // This provides initialization of the canvas.  From here the various
    // event listeners we care about are prepared, along with setting up
    // the canvas for rendering.
    //
    //------------------------------------------------------------------
    function initialize() {
        canvas = document.getElementById('canvas-main');
        context = canvas.getContext('2d');

        window.addEventListener('resize', function() {
            resizeCanvas();
        }, false);
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
    }

    //------------------------------------------------------------------
    //
    // Renders the text based on the provided spec.
    //
    //------------------------------------------------------------------
    function drawText(spec) {
        context.font = spec.font;
        context.fillStyle = spec.fill;
        context.textBaseline = 'top';

        context.fillText(
            spec.text,
            world.left + spec.position.x * world.size,
            world.top + spec.position.y * world.size);
    }

    //------------------------------------------------------------------
    //
    // This returns the height of the specified font, in world units.
    //
    //------------------------------------------------------------------
    function measureTextHeight(spec) {
        let height = 0;
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fill;

        height = context.measureText('m').width / world.size;

        context.restore();

        return height;
    }

    //------------------------------------------------------------------
    //
    // This returns the width of the specified font, in world units.
    //
    //------------------------------------------------------------------
    function measureTextWidth(spec) {
        let width = 0;
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fill;

        width = context.measureText(spec.text).width / world.size;

        context.restore();

        return width;
    }

    //------------------------------------------------------------------
    //
    // Draw a line segment within the unit world.
    //
    //------------------------------------------------------------------
    function drawLine(style, pt1, pt2) {
        context.strokeStyle = style;
        context.beginPath();
        context.moveTo(
            0.5 + world.left + (pt1.x * world.size),
            0.5 + world.top + (pt1.y * world.size));
        context.lineTo(
            0.5 + world.left + (pt2.x * world.size),
            0.5 + world.top + (pt2.y * world.size));
        context.stroke();
    }

    //------------------------------------------------------------------
    //
    // Draw a circle within the unit world.
    //
    //------------------------------------------------------------------
    function drawCircle(style, center, radius, useViewport) {
        let adjustLeft = (useViewport === true) ? viewport.left : 0;
        let adjustTop = (useViewport === true) ? viewport.top : 0;

        //
        // 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
        context.strokeStyle = style;
        context.beginPath();
        context.arc(
            0.5 + world.left + ((center.x - adjustLeft) * world.size),
            0.5 + world.top + ((center.y - adjustTop) * world.size),
            radius * world.size,
            0, 2 * Math.PI);
        context.stroke();
    }

    //------------------------------------------------------------------
    //
    // Draw a filled circle within the unit world.
    //
    //------------------------------------------------------------------
    function drawFilledCircle(style, center, radius, useViewport) {
        let adjustLeft = (useViewport === true) ? viewport.left : 0;
        let adjustTop = (useViewport === true) ? viewport.top : 0;

        //
        // 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
        context.fillStyle = style;
        context.beginPath();
        context.arc(
            0.5 + world.left + ((center.x - adjustLeft) * world.size),
            0.5 + world.top + ((center.y - adjustTop) * world.size),
            radius * world.size,
            0, 2 * Math.PI);
        context.fill();
    }

    //------------------------------------------------------------------
    //
    // Draws a rectangle relative to the 'unit world'.
    //
    //------------------------------------------------------------------
    function drawRectangle(style, left, top, width, height, useViewport) {
        let adjustLeft = (useViewport === true) ? viewport.left : 0;
        let adjustTop = (useViewport === true) ? viewport.top : 0;

        //
        // 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
        context.strokeStyle = style;
        context.strokeRect(
            0.5 + world.left + ((left - adjustLeft) * world.size),
            0.5 + world.top + ((top - adjustTop) * world.size),
            width * world.size,
            height * world.size);
    }

    //------------------------------------------------------------------
    //
    // Draws a filled rectangle relative to the 'unit world'.
    //
    //------------------------------------------------------------------
    function drawFilledRectangle(style, left, top, width, height, useViewport) {
        let adjustLeft = (useViewport === true) ? viewport.left : 0;
        let adjustTop = (useViewport === true) ? viewport.top : 0;

        //
        // 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
        context.fillStyle = style;
        context.fillRect(
            0.5 + world.left + ((left - adjustLeft) * world.size),
            0.5 + world.top + ((top - adjustTop) * world.size),
            width * world.size,
            height * world.size);
    }

    //------------------------------------------------------------------
    //
    // Pass-through that allows an image to be drawn.  Sometimes the viewport
    // doesn't need to be accounted for (e.g., in the case of a background image).
    // Therefore, the useViewport parameter is used to control if it is accounted for.
    //
    //------------------------------------------------------------------
    function drawImage() {
        let image = arguments[0],
            sx, sy,
            sWidth, sHeight,
            dx, dy,
            dWidth, dHeight,
            useViewport;

        //
        // Figure out which version of drawImage was called and extract the correct values
        if (arguments.length === 5 || arguments.length === 6) {
            sx = 0;
            sy = 0;
            sWidth = image.width;
            sHeight = image.height;
            dx = arguments[1];
            dy = arguments[2];
            dWidth = arguments[3];
            dHeight = arguments[4];
            useViewport = arguments[5];
        } else if (arguments.length === 9 || arguments.length === 10) {
            sx = arguments[1];
            sy = arguments[2];
            sWidth = arguments[3];
            sHeight = arguments[4];
            dx = arguments[5];
            dy = arguments[6];
            dWidth = arguments[7];
            dHeight = arguments[8];
            useViewport = arguments[9];
        }

        if (useViewport) {
            dx -= viewport.left;
            dy -= viewport.top;
        }

        //
        // Convert from world to pixel coordinates on a few items.  Using
        // floor and ceil to prevent pixel boundary rendering issues.
        context.drawImage(
            image,
            sx, sy,
            sWidth, sHeight,
            Math.floor(dx * world.size + world.left), Math.floor(dy * world.size + world.top),
            Math.ceil(dWidth * world.size), Math.ceil(dHeight * world.size));
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through to save the canvas context.
    //
    //------------------------------------------------------------------
    function saveContext() {
        context.save();
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through the restore the canvas context.
    //
    //------------------------------------------------------------------
    function restoreContext() {
        context.restore();
    }

    //------------------------------------------------------------------
    //
    // Perform a rotation of the canvas so that the next things rendered
    // will appear as rotated (after the canvas rotation is undone).
    //
    //------------------------------------------------------------------
    function rotateCanvas(center, rotation) {
        context.translate((center.x - viewport.left) * world.size + world.left, (center.y - viewport.top) * world.size + world.top);
        context.rotate(rotation);
        context.translate(-((center.x - viewport.left) * world.size + world.left), -((center.y - viewport.top) * world.size + world.top));
    }

    //------------------------------------------------------------------
    //
    // This converts from client (pixel) coordinates to the unit world coordinates.
    //
    //------------------------------------------------------------------
    function clientToWorld(clientX, clientY) {
        return {
            x: (clientX - world.left) / world.size,
            y: (clientY - world.top) / world.size
        };
    }

    //------------------------------------------------------------------
    //
    // Create a clipping region for the area in which the rendering
    // takes place.
    //
    //------------------------------------------------------------------
    function clip() {
        //
        // The beginPath is necessary, because .rect adds to the current path.
        // Without the beginPath, repeated calls to clip keep adding to the current
        // path and slows things down to a crawl very, very quickly.
        context.beginPath();
        context.rect(world.left, world.top, world.size, world.size);
        context.clip();
    }

    return {
        initialize: initialize,
        toggleFullScreen: toggleFullScreen,
        clearCanvas: clearCanvas,
        drawText: drawText,
        measureTextHeight: measureTextHeight,
        measureTextWidth: measureTextWidth,
        drawLine: drawLine,
        drawRectangle: drawRectangle,
        drawFilledRectangle: drawFilledRectangle,
        drawCircle: drawCircle,
        drawFilledCircle: drawFilledCircle,
        drawImage: drawImage,
        saveContext: saveContext,
        restoreContext: restoreContext,
        rotateCanvas: rotateCanvas,
        clientToWorld: clientToWorld,
        notifyResize: notifyResize,
        clip: clip,
        get viewport() { return viewport; }
    };

}());
