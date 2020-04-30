# Responsive Canvas

The purpose of this sample is to demonstrate how to resize the `<canvas>` element based upon changes in size and orientation of the browser.  After a user navigates to a web address, they may change the size of the browser, and the content inside the page should scale accordingly.  This holds true for web-based games, the UI and rendering of the game should scale based upon the browser size and orientation.

The other feature this sample demonstrates is that of enabling a full-screen view.  For games it is often nice to take over the display so the user only sees the game.  This goes hand-in-hand with adjusting the rendering based upon the browser window size.

## Starting The Demo

The sample must be run as a server: `node server.js` \
With the server running, connect to: `http://localhost:3000`

The sample can also be run simply by opening `index.html` in a browser.

## Using The Demo

After startup you'll see a rotating square.  As the browser is resized, the rendering always stays a square, rather than changing shape into a rectangular size based upon the window size.  In a game, square things need to stay square, rectangles need to stay rectangles, circles need to stay circles, and so on.

When the mouse is clicked on the browser, it changes to full-screen rendering.  Clicking again restores the view back to the original browser size and location.

## Code Review

At startup, two event listeners are added to the browser window, `resize` and `orientationchange`.  The `resize` event is fired when the browser window changes size, while `orientationchange` is fired if the browser, well, orientation changes.  `orientationchange` only occurs on mobile devices, in response to the phone itself changing orientation.  In both cases, the game code needs to revise how rendering is being performed.

These events are registered during startup with the following code...

```javascript
    window.addEventListener('resize', resizeCanvas, false);
    window.addEventListener('orientationchange', resizeCanvas, false);
```

In both cases, the `resizeCanvas` function is called.  `resizeCanvas` set the size of the `<canvas>` element to be the size of the inner width/height of the window, as follows...

```javascript
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
```

After changing the `<canvas>` element size the `resizeCanvas` function reports to the console the new layout of the `<canvas>` element...for demonstration purposes, it does affect the rendering.

### Rendering The Square

No magic here, mostly just a test to determine whether the canvas width or height is the larger dimension.  Depending upon which is larger, the appropriate left/top corner is determined, along with the width and height for the square.  The smallest of the width or height is used to determine the size of a square side.  This is the code that makes those computations...

```javascript
    if (canvas.width < canvas.height) {
        smallestSize = canvas.width;
        squareSize = smallestSize * 0.6;
        cornerLeft = Math.floor(canvas.width * 0.2);
        cornerTop = (canvas.height - squareSize) / 2;
    } else {
        smallestSize = canvas.height;
        squareSize = smallestSize * 0.6;
        cornerLeft = (canvas.width - squareSize) / 2;
        cornerTop = Math.floor(canvas.height * 0.2);
    }
```

The code in this sample recomputes this every animation frame.  Because this is the only code executing each frame, performance isn't an issue.  Where performance is concerned, these computations should be performed only on a resize or orientation change event and then used in the rendering.

### Full Screen

The key piece of code that does this is the following...

```javascript
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
```

Mozilla has excellent documentation on this technique, found at this location <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API" target="_blank">link.</a>  In fact, the code above comes from the documentation.
