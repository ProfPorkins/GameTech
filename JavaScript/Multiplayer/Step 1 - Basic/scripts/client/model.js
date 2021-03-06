// ------------------------------------------------------------------
//
// This namespace holds the Basic networked multi-player game model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components, renderer) {
    'use strict';
    let myKeyboard = input.Keyboard();
    let that = {};
    let playerSelf = components.SpaceShip({
        image: Demo.assets['spaceship-blue'],
        size: { width: 0.0, height: 0.0 },
        center: { x: 0.0, y: 0.0 },
        direction: 0.0
    });
    let playerOthers = {};
    let socket = io();
    let networkQueue = Queue.create();

    socket.on(NetworkIds.CONNECT_ACK, data => {
        networkQueue.enqueue({
            type: NetworkIds.CONNECT_ACK,
            data: data
        });
    });

    socket.on(NetworkIds.CONNECT_OTHER, data => {
        networkQueue.enqueue({
            type: NetworkIds.CONNECT_OTHER,
            data: data
        });
    });

    socket.on(NetworkIds.DISCONNECT_OTHER, data => {
        networkQueue.enqueue({
            type: NetworkIds.DISCONNECT_OTHER,
            data: data
        });
    });

    socket.on(NetworkIds.UPDATE_SELF, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_SELF,
            data: data
        });
    });

    socket.on(NetworkIds.UPDATE_OTHER, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_OTHER,
            data: data
        });
    });

    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    function connectPlayerSelf(data) {
        playerSelf.center.x = data.center.x;
        playerSelf.center.y = data.center.y;

        playerSelf.size.width = data.size.width;
        playerSelf.size.height = data.size.height;

        playerSelf.direction = data.direction;
    }

    //------------------------------------------------------------------
    //
    // Handler for when a new player connects to the game.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    function connectPlayerOther(data) {
        let model = components.SpaceShip({
            image: Demo.assets['spaceship-red'],
            size: { width: data.size.width, height: data.size.height },
            center: { x: data.center.x, y: data.center.y },
            direction: data.direction
        });

        playerOthers[data.clientId] = model;
    }

    //------------------------------------------------------------------
    //
    // Handler for when another player disconnects from the game.
    //
    //------------------------------------------------------------------
    function disconnectPlayerOther(data) {
        delete playerOthers[data.clientId];
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about the self player.
    //
    //------------------------------------------------------------------
    function updatePlayerSelf(data) {
        playerSelf.center.x = data.center.x;
        playerSelf.center.y = data.center.y;

        playerSelf.direction = data.direction;
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about other players.
    //
    //------------------------------------------------------------------
    function updatePlayerOther(data) {
        if (playerOthers.hasOwnProperty(data.clientId)) {
            let model = playerOthers[data.clientId];

            model.center.x = data.center.x;
            model.center.y = data.center.y
    
            model.direction = data.direction;
        }
    }

    // ------------------------------------------------------------------
    //
    // This function initializes the input demo model.
    //
    // ------------------------------------------------------------------
    that.initialize = function() {
        console.log('game initializing...');

        //
        // Create the keyboard input handler and register the keyboard commands
        myKeyboard.registerHandler(elapsedTime => {
                socket.emit(NetworkIds.INPUT, {
                    type: NetworkIds.INPUT_MOVE,
                    elapsedTime: elapsedTime 
                });
            },
            'w', true);

        myKeyboard.registerHandler(elapsedTime => {
                socket.emit(NetworkIds.INPUT, {
                    type: NetworkIds.INPUT_ROTATE_RIGHT,
                    elapsedTime: elapsedTime 
                });
            },
            'd', true);

        myKeyboard.registerHandler(elapsedTime => {
                socket.emit(NetworkIds.INPUT, {
                    type: NetworkIds.INPUT_ROTATE_LEFT,
                    elapsedTime: elapsedTime 
                });
            },
            'a', true);
    };

    // ------------------------------------------------------------------
    //
    // Process all input for the model here.
    //
    // ------------------------------------------------------------------
    that.processInput = function(elapsedTime) {
        //
        // Start with the keyboard updates so those messages can get in transit
        // while the local updating of received network messages are processed.
        myKeyboard.update(elapsedTime);

        //
        // Double buffering on the queue so we don't asynchronously receive messages
        // while processing.
        let processMe = networkQueue;
        networkQueue = networkQueue = Queue.create();
        while (!processMe.empty) {
            let message = processMe.dequeue();
            switch (message.type) {
                case NetworkIds.CONNECT_ACK:
                    connectPlayerSelf(message.data);
                    break;
                case NetworkIds.CONNECT_OTHER:
                    connectPlayerOther(message.data);
                    break;
                case NetworkIds.DISCONNECT_OTHER:
                    disconnectPlayerOther(message.data);
                    break;
                case NetworkIds.UPDATE_SELF:
                    updatePlayerSelf(message.data);
                    break;
                case NetworkIds.UPDATE_OTHER:
                    updatePlayerOther(message.data);
                    break;
            }
        }
    };

    // ------------------------------------------------------------------
    //
    // This function is used to update the state of the demo model.
    //
    // ------------------------------------------------------------------
    that.update = function(elapsedTime) {
    };

    // ------------------------------------------------------------------
    //
    // This function renders the demo model.
    //
    // ------------------------------------------------------------------
    that.render = function() {
        //
        // Draw a border around the unit world.
        renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);

        renderer.SpaceShip.render(playerSelf);
        for (let id in playerOthers) {
            renderer.SpaceShip.render(playerOthers[id]);
        }
    };

    return that;

}(Demo.input, Demo.components, Demo.renderer));
