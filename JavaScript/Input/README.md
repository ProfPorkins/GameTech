# Keyboard & Mouse Input Demo

This sample demonstrates collection and processing of keyboard and mouse inputs.  Each input type allows for commands to be dynamically registered and unregistered at runtime.

The goal of the code is this sample is to abstract input from browser specific events, to the kinds of events a game might need.  For example, the browser has various events that let you know when a key was pressed or released, among others.  These are fine, but there is one big problem with the way browser sends input events, along with other capabilities a game wants.

The major issue with the input events send by the browser has to do with the way it repeatedly sends a `keydown`.  When a key is pressed, the browser sends an event.  As the key continues to be pressed, additional events are sent.  Between the first and send event firing, there is a slight pause, then between the second and third event firing, and all subsequent event notifications, the time between them is the same.  Several issues with this.  The first, is the pause that exists between the first and second event notifications.  The other is the timing of subsequent event notifications.  There is no rule for how often those events are sent, and a game needs to be in control of input events.

The code in this sample solves the above problems, along with adding in new capabilities.  These new capabilities include: Specifying an input event is signaled only one time, setting the time delay between repeated input events, or receiving input events as fast as possible (the same rate as the frame rate).

## Starting The Demo

The sample must be run as a server: `node server.js` \
With the server running, connect to: `http://localhost:3000`

## Using The Demo

At startup the demo allows the use of the `a`/`s`/`d` keys to move the three text samples down and `q`/`w`/`e` to move them up.

* The red text demonstrates a handler that responds once per key-press.
* The green text demonstrates a handler that continuously responds while a key is pressed.
* The purple text demonstrates a handler that rate-limits how often a handler will be invoked.
* The circle can be moved to any location within the window by left mouse clicking.  While the mouse is down (captured), the circle will move to the location of the mouse cursor.

When the `t` key is pressed, the inputs are toggled.  The keyboard inputs change to `j`/`k`/`l` for down movement, `u`/`i`/`o` for up movement, and the mouse movement is disabled, but the mouse click will still invoke the handler.

Try pressing all three down keyboard commands while also clicking and moving the mouse.  While doing this, you'll be able to see all the input events smoothly invoked.

## Code Review

The browser provide an <a href="https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener" target="_blank">addEventListener</a> API to enable code to register for input <a href="https://developer.mozilla.org/en-US/docs/Web/Events" target="_blank">events</a>.  Depending on the specific needs of the game, this API can be called from the browser window, a specific browser document, or event an element within a document.  For all of the code samples in this repository <a href="https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener" target="_blank">addEventListener</a> is called from the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window" target="_blank">window</a> object.

For keyboard input, the specific events of interest are <a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event" target="_blank">keydown</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/keyup_event" target="_blank">keyup</a>.

For mouse input, the specific events of interest are <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event" target="_blank">mousedown</a>, <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event" target="_blank">mouseup</a>, and <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event" target="_blank">mousemove</a>.

### Keyboard Input

Keyboard input is abstracted by the `Keyboard` object.  There is a `Demo.input.Keyboard` function created when `Keyboard.js` is loaded.  Calling this function creates a `Keyboard` object.  The returned object doesn't actually have a type name, but for our purposes here, I call it a `Keyboard` object.

Internal to the `Keyboard` object is a `keys` object.  The purpose of this object is to track when keys are currently pressed.  Related to it, is another object called `keyRepeat`, which is used to track whether or not an event has been signaled for a handler that wants repeated notifications.

When the `keydown` event is signaled by the browser, the `keyDown` function inside of the `Keyboard` object is invoked.  This function adds a key/value pair, if it doesn't already exist, for the key that was pressed; if the key already exists, the value is replaced.  The value is a timestamp for when the event occurred.  The timestamp value isn't ever used by the code, it is just something to store as a value, rather than nothing.

When the `keyup` event is signaled by the browser, the `keyUp` function inside of hte `Keyboard` object is invoked.  This function removed the key/value pair from the `keys` and `keyRepeat` objects.

#### Registering for Input Events

The next part of the `Keyboard` object to consider is the `registerHandler` function.  This function allows client code to register for keyboard input events.  The return value from this function is an identifier which can be used to unregister an input handler.  The parameters to this function allow for different kinds of input signaling to occur:

* **handler**  This is the function to invoke when signaling the event.
* **key** Which key to receive events for.
* **repeat** True is repeated events should be signaled while the key is pressed, False for one event per `keydown` event.
* **rate** How often (in milliseconds) should repeated events be signaled while the key is pressed.

It is used like this...

```javascript
    let myKeyboard = input.Keyboard();
    let handlerId = myKeyboard.registerHandler(function() {
                ...handler logic goes here...
            },
            'a', true, 250
        );
```

When an input event handler is registered, an entry in the `handlers` object is created, with the `key` as the key to the entry.  The value for the entry includes the unique identifier for that handler, the key, whether or not it repeats, how often it repeats (if it repeats), how long since the event was last signaled (`elapsedTime`), and the function to invoke when signaling.  `elapsedTime` is how long it has been since that event was signaled.  It is initially set to time-frame for how often to repeat the event, so that the first time the key is pressed, the event is signaled.

The code inside the `Keyboard` object to register the handler is this...

```javascript
    if (!handlers.hasOwnProperty(key)) {
        handlers[key] = [];
    }
    handlers[key].push({
        id: nextHandlerId,
        key: key,
        repeat: repeat,
        rate: rate,
        elapsedTime: rate,
        handler: handler
    });
```

The first bit of code checks to see if there is an entry in the `handlers` object.  If not, an entry is created, with the value being an array.  The reason for an array is to allow multiple handlers to be invoked from a single keyboard input.

#### Unregistering from Input Events

It is usually necessary to terminate receiving input notifications, or unregistering a handler.  The `registerHandler` function returns a unique id when a handler is registered.  The code registering the handler needs to keep track of that id for later use when it is necessary to unregister.

The `unregisterHandler` function accepts the `key` and `id` to unregister.  Technically, only the `id` should be necessary, but to improve performance the `key` is required.  Without the `key` either the code would have to perform a linear search through all handlers, or increase the code complexity to have another key/value object indexed on `id` used to locate the handler.  Realistically, not very many input handlers are registered and any particular time and the rate at which they are registered and unregistered is extremely low, making a linear search not a terrible thing to have to do; but I chose not to do that regardless.

Client code to unregister a handler would look like...

```javascript
    myKeyboard.unregisterHandler('a', handlerId);
```

#### Input Signaling

The `Keyboard` object exposes an `update` function that is expected to be called during the input processing stage of the game loop.  It is during this function handlers are invoked.  The logic for this function is as follows...

* Iterate through all the `keys` that are recorded.
  * If there are any registered handlers for they `key`
    * Iterate through the array of registered handlers
      * Update the elapsed time for the handler
      * If the handler should signal repeated events
        * If enough time has accumulated since the event was last signaled
          * Invoke the handler's function
          * Update the elapsed time by subtracting off the rate at which to repeat
      * Else if single event and it hasn't been signaled before
        * Invoke the handler's function
        * Mark the event has having been signaled

### Mouse Input

The code for the mouse input is fundamentally similar to the keyboard code.  However, there is one item unique to mouse input handling I want to review, this is the concept of _capture_.

When using a mouse you often want to click and drag, maybe to draw something, or to move an item from one place to another.  For example, the user first clicks, and keeps the button down, then moves the mouse, then releases the button.  When the user clicks, we _capture_ the mouse and listen (and do something) to the move events that occur until the user releases the button.  If the user has not clicked the button, we don't want to receive all the move events.  Only when the mouse is _captured_ do we want to know about the move events.

The `registerHandler` function for the `Mouse` object starts out like this...

```javascript
    that.registerHandler = function(handler, type, requireCapture) {
```

The third parameter, `requireCapture` is set to true if the mouse must be _captured_ in order for the event to be signaled.  The value of the parameter is recorded with the event, and then tested during the `update` function when looking to invoke handlers.

Note, it only makes sense for capture to be tested on mouse move events.  There is no meaning to signal a mouse click only if the mouse is captured.  The mouse can't have been captured unless a click had already occurred.  Similarly, it doesn't have any meaning to signal a mouse button release event only if the mouse is captured.  By definition, if a mouse release occurs, the mouse is captured.
