# Keyboard & Mouse Input Demo
The sample can be run by opening `index.html` in a browser.

This sample demonstrates collection and processing of keyboard and mouse inputs.  Each input type allows for commands to be dynamically registered and unregistered at runtime.

At startup the demo allows the use of the a/s/d keys to move the three text samples down and q/w/e to move them up.  The red text demonstrates a handler that responds once per keypress.  The green text demonstrates a handler that continuously reponds while a key is pressed. The purple text demonstrates a handler that rate-limits how often a handler will be invoked.  The circle can be moved to any location within the window by left mouse clicking.  While the mouse is down (captured), the circle will move to the location of the mouse cursor.

When the 't' key is pressed, the inputs are toggled.  The keyboard inputs change to j/k/l for down movement, u/i/o for up movement, and the mouse movement is disabled, but the mouse click will still invoke the handler.

Try pressing all three down keyboard commands while also clicking and moving the mouse.  While doing this, you'll be able to see all the input events smoothly invoked.