// ------------------------------------------------------------------
//
// Input handling support
//
// ------------------------------------------------------------------
Demo.input.Mouse = function() {
    'use strict';
    let eventMouseDown = [];
    let eventMouseUp = [];
    let eventMouseMove = [];
    let handlersDown = {};
    let handlersUp = {};
    let handlersMove = {};
    let nextHandlerId = 0;        // Used to uniquely identify handlers
    let mouseCapture = false;    // Initial state of the mouse capture
    let that = {
            //
            // Use these as constants for the mouse event types
            get EventMouseMove() { return 0; },
            get EventMouseUp() { return 1; },
            get EventMouseDown() { return 2; }
        };

    // ------------------------------------------------------------------
    //
    // Allows the client code to register a mouse handler.
    //
    // ------------------------------------------------------------------
    that.registerHandler = function(handler, type, requireCapture) {
        let handlerId = nextHandlerId;

        nextHandlerId += 1;
        //
        // Capture only makes sense in the context of mouse move, therefore
        // it is ignored for mouse down and mouse up handlers.
        if (type === that.EventMouseDown) {
            handlersDown[handlerId] = {
                handler: handler
            };
        } else if (type === that.EventMouseUp) {
            handlersUp[handlerId] = {
                handler: handler
            };
        } else if (type === that.EventMouseMove) {
            handlersMove[handlerId] = {
                handler: handler,
                requireCapture: requireCapture
            };
        }

        return handlerId;
    };

    // ------------------------------------------------------------------
    //
    // Allows the client code to unregister a mouse handler.
    //
    // ------------------------------------------------------------------
    that.unregisterHandler = function(type, id) {
        if (type === that.EventMouseDown) {
            if (handlersDown.hasOwnProperty(id)) {
                delete handlersDown[id];
            }
        } else if (type === that.EventMouseUp) {
            if (handlersUp.hasOwnProperty(id)) {
                delete handlersUp[id];
            }
        } else if (type === that.EventMouseMove) {
            if (handlersMove.hasOwnProperty(id)) {
                delete handlersMove[id];
            }
        }
    };

    // ------------------------------------------------------------------
    //
    // Called when the 'mousedown' event is fired from the browser.
    //
    // ------------------------------------------------------------------
    function mouseDown(event) {
        mouseCapture = true;
        eventMouseDown.push(event);
    }

    // ------------------------------------------------------------------
    //
    // Called when the 'mouseup' event is fired from the browser.
    //
    // ------------------------------------------------------------------
    function mouseUp(event) {
        mouseCapture = false;
        eventMouseUp.push(event);
    }

    // ------------------------------------------------------------------
    //
    // Called when the 'mousemove' event is fired from the browser.
    //
    // ------------------------------------------------------------------
    function mouseMove(event) {
        eventMouseMove.push(event);
    }

    // ------------------------------------------------------------------
    //
    // Allows the client to invoke all the handlers for the registered mouse events.
    //
    // ------------------------------------------------------------------
    that.update = function(elapsedTime) {
        let event = 0;
        let handlerId = 0;
        let entry = null;

        //
        // Process the mouse events for each of the different kinds of handlers
        for (event = 0; event < eventMouseDown.length; event += 1) {
            for (handlerId in handlersDown) {
                if (handlersDown.hasOwnProperty(handlerId)) {
                    handlersDown[handlerId].handler(eventMouseDown[event], elapsedTime);
                }
            }
        }

        for (event = 0; event < eventMouseUp.length; event += 1) {
            for (handlerId in handlersUp) {
                if (handlersUp.hasOwnProperty(handlerId)) {
                    handlersUp[handlerId].handler(eventMouseUp[event], elapsedTime);
                }
            }
        }

        for (event = 0; event < eventMouseMove.length; event += 1) {
            for (handlerId in handlersMove) {
                if (handlersMove.hasOwnProperty(handlerId)) {
                    entry = handlersMove[handlerId];
                    //
                    // Mouse capture is unique to the move events, check for it before invoking the handler
                    if (entry.requireCapture && mouseCapture === true) {
                        entry.handler(eventMouseMove[event], elapsedTime);
                    } else if (entry.requireCapture === false) {
                        entry.handler(eventMouseMove[event], elapsedTime);
                    }
                }
            }
        }

        //
        // Now that we have processed all the inputs, reset everything back to the empty state
        eventMouseDown.length = 0;
        eventMouseUp.length = 0;
        eventMouseMove.length = 0;
    };

    //
    // This is how we receive notification of mouse events.
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('mousemove', mouseMove);

    return that;
};
