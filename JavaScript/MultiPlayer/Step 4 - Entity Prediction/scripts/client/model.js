// ------------------------------------------------------------------
//
// This namespace holds the Entity Interpolation game model.
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
        momentum: { x: 0.0, y: 0.0 },
        direction: 0.0,
        rotateRate: 0.0,
        thrustRate: 0.0
    });
    let playerOthers = {};
    let messageHistory = Demo.utilities.Queue();
    let messageId = 1;
    let socket = io();

    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    socket.on('connect-ack', function(data) {
        playerSelf.momentum.x = data.momentum.x;
        playerSelf.momentum.y = data.momentum.y;

        playerSelf.center.x = data.center.x;
        playerSelf.center.y = data.center.y;

        playerSelf.size.width = data.size.width;
        playerSelf.size.height = data.size.height;

        playerSelf.direction = data.direction;
        playerSelf.rotateRate = data.rotateRate;
        playerSelf.thrustRate = data.thrustRate;
    });

    //------------------------------------------------------------------
    //
    // Handler for when a new player connects to the game.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    socket.on('connect-other', function(data) {
        let model = components.SpaceShipRemote({
            image: Demo.assets['spaceship-red'],
            size: { width: data.size.width, height: data.size.height },
            thrustRate: data.thrustRate,
            state: {
                center: { x: data.center.x, y: data.center.y },
                direction: data.direction,
                momentum: { x: data.momentum.x, y: data.momentum.y }
            },
            start: {
                center: { x: data.center.x, y: data.center.y },
                direction: data.direction
            },
            goal: {
                center: { x: data.center.x, y: data.center.y },
                direction: data.direction,
                updateWindow: 0,
                updatedTime: 0,
            }
        });

        playerOthers[data.clientId] = model;
    });

    //------------------------------------------------------------------
    //
    // Handler for when another player disconnects from the game.
    //
    //------------------------------------------------------------------
    socket.on('disconnect-other', function(data) {
        delete playerOthers[data.clientId];
    });

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about the self player.
    //
    //------------------------------------------------------------------
    socket.on('update-self', function(data) {
        playerSelf.momentum.x = data.momentum.x;
        playerSelf.momentum.y = data.momentum.y;
        playerSelf.center.x = data.center.x;
        playerSelf.center.y = data.center.y;
        playerSelf.direction = data.direction;

        //
        // Remove messages from the queue up through the last one identified
        // by the server as having been processed.
        let done = false;
        while (!done && !messageHistory.empty) {
            if (messageHistory.front.id === data.lastMessageId) {
                done = true;
            }
            messageHistory.dequeue();
        }

        //
        // Update the client simulation since the last server update, by
        // replaying the remaining inputs.
        let memory = Demo.utilities.Queue();
        while (!messageHistory.empty) {
            let message = messageHistory.dequeue();
            switch (message.type) {
                case 'thrust':
                    playerSelf.thrust(message.elapsedTime);
                    break;
                case 'rotate-right':
                    playerSelf.rotateRight(message.elapsedTime);
                    break;
                case 'rotate-left':
                    playerSelf.rotateLeft(message.elapsedTime);
                    break;
            }
            memory.enqueue(message);
        }
        messageHistory = memory;
    });

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about other players.
    //
    //------------------------------------------------------------------
    socket.on('update-other', function(data) {
        if (playerOthers.hasOwnProperty(data.clientId)) {
            let model = playerOthers[data.clientId];
            model.goal.updateWindow = data.updateWindow;
            model.goal.updatedTime = 0;

            model.state.momentum.x = data.momentum.x;
            model.state.momentum.y = data.momentum.y;

            model.goal.center.x = data.center.x;
            model.goal.center.y = data.center.y
    
            model.goal.direction = data.direction;

            model.start.center.x = model.state.center.x;
            model.start.center.y = model.state.center.y;
            model.start.direction = model.state.direction;
        }
    });

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
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: 'thrust'
            };
            socket.emit('input', message);
            messageHistory.enqueue(message);
            playerSelf.thrust(elapsedTime);
        },
        'w', true);

        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: 'rotate-right'
            };
            socket.emit('input', message);
            messageHistory.enqueue(message);
            playerSelf.rotateRight(elapsedTime);
        },
        'd', true);

        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: 'rotate-left'
            };
            socket.emit('input', message);
            messageHistory.enqueue(message);
            playerSelf.rotateLeft(elapsedTime);
        },
        'a', true);
    };

    // ------------------------------------------------------------------
    //
    // Process all input for the model here.
    //
    // ------------------------------------------------------------------
    that.processInput = function(elapsedTime) {
        myKeyboard.update(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // This function is used to update the state of the demo model.
    //
    // ------------------------------------------------------------------
    that.update = function(elapsedTime) {
        playerSelf.update(elapsedTime);
        for (let clientId in playerOthers) {
            playerOthers[clientId].update(elapsedTime);
        }
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
