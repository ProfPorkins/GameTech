// ------------------------------------------------------------------
//
// This namespace holds the Particle System demo model.
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

    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    socket.on('connect-ack', function(data) {
        playerSelf.center.x = data.center.x;
        playerSelf.center.y = data.center.y;

        playerSelf.size.width = data.size.width;
        playerSelf.size.height = data.size.height;

        playerSelf.direction = data.direction;
    });

    //------------------------------------------------------------------
    //
    // Handler for when a new player connects to the game.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    socket.on('connect-other', function(data) {
        let model = components.SpaceShip({
            image: Demo.assets['spaceship-red'],
            size: { width: data.size.width, height: data.size.height },
            center: { x: data.center.x, y: data.center.y },
            direction: data.direction
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
        playerSelf.center.x = data.center.x;
        playerSelf.center.y = data.center.y;

        playerSelf.direction = data.direction;
    });

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about other players.
    //
    //------------------------------------------------------------------
    socket.on('update-other', function(data) {
        if (playerOthers.hasOwnProperty(data.clientId)) {
            let model = playerOthers[data.clientId];

            model.center.x = data.center.x;
            model.center.y = data.center.y
    
            model.direction = data.direction;
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
                socket.emit('input', {
                    type: 'move',
                    elapsedTime: elapsedTime 
                });
            },
            'w', true);

        myKeyboard.registerHandler(elapsedTime => {
                socket.emit('input', {
                    type: 'rotate-right',
                    elapsedTime: elapsedTime 
                });
            },
            'd', true);

        myKeyboard.registerHandler(elapsedTime => {
                socket.emit('input', {
                    type: 'rotate-left',
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
        myKeyboard.update(elapsedTime);
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
