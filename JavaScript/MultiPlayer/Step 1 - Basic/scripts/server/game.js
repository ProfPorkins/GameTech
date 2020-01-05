// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------
'use strict';

let present = require('present');
let Player = require('./player');

const UPDATE_RATE_MS = 100; // How often to update the game model
let quit = false;
let activeClients = {};
let inputQueue = [];

//------------------------------------------------------------------
//
// Process the network inputs we have received since the last time
// the game loop was processed.
//
//------------------------------------------------------------------
function processInput() {
    //
    // Double buffering on the queue so we don't asynchronously receive inputs
    // while processing.
    let processMe = inputQueue;
    inputQueue = [];

    for (let inputIndex in processMe) {
        let input = processMe[inputIndex];
        let client = activeClients[input.id];
        switch (input.message.type) {
            case 'move':
                client.player.move(input.message.elapsedTime);
                break;
            case 'rotate-left':
                client.player.rotateLeft(input.message.elapsedTime);
                break;
            case 'rotate-right':
                client.player.rotateRight(input.message.elapsedTime);
                break;
        }
    }
}

//------------------------------------------------------------------
//
// Update the simulation of the game.
//
//------------------------------------------------------------------
function update(elapsedTime, currentTime) {
    for (let id in activeClients) {
        activeClients[id].player.update(currentTime);
    }
}

//------------------------------------------------------------------
//
// Send state of the game to any connected clients.
//
//------------------------------------------------------------------
function updateClients() {
    for (let id in activeClients) {
        let client = activeClients[id];
        let update = {
            id: id,
            direction: client.player.direction,
            center: client.player.center
        };
        if (client.player.reportUpdate) {
            client.socket.emit('update-self', update);

            //
            // Notify all other connected clients about every
            // other connected client status...but only if they are updated.
            for (let otherId in activeClients) {
                if (otherId !== id) {
                    activeClients[otherId].socket.emit('update-other', update);
                }
            }
        }
    }

    for (let id in activeClients) {
        activeClients[id].player.reportUpdate = false;
    }
}

//------------------------------------------------------------------
//
// Server side game loop
//
//------------------------------------------------------------------
function gameLoop(currentTime, elapsedTime) {
    processInput();
    update(elapsedTime, currentTime);
    updateClients();

    if (!quit) {
        setTimeout(() => {
            let now = present();
            gameLoop(now, now - currentTime);
        }, UPDATE_RATE_MS);
    }
}

//------------------------------------------------------------------
//
// Get the socket.io server up and running so it can begin
// collecting inputs from the connected clients.
//
//------------------------------------------------------------------
function initializeSocketIO(httpServer) {
    let io = require('socket.io')(httpServer);

    //------------------------------------------------------------------
    //
    // Notifies the already connected clients about the arrival of this
    // new client.  Plus, tell the newly connected client about the
    // other players already connected.
    //
    //------------------------------------------------------------------
    function notifyConnect(socket, newPlayer) {
        for (let id in activeClients) {
            let client = activeClients[id];
            if (newPlayer.id !== id) {
                //
                // Tell existing about the newly connected player
                client.socket.emit('connect-other', {
                    id: newPlayer.id,
                    direction: newPlayer.direction,
                    center: newPlayer.center,
                    size: newPlayer.size
                });

                //
                // Tell the new player about the already connected player
                socket.emit('connect-other', {
                    id: client.player.id,
                    direction: client.player.direction,
                    center: client.player.center,
                    size: client.player.size
                });
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Notifies the already connected clients about the disconnect of
    // another client.
    //
    //------------------------------------------------------------------
    function notifyDisconnect(playerId) {
        for (let id in activeClients) {
            let client = activeClients[id];
            if (playerId !== id) {
                client.socket.emit('disconnect-other', {
                    id: playerId
                });
            }
        }
    }
    
    //------------------------------------------------------------------
    //
    // A new connection (browser) was made.  Create a new player at the server
    // and send that information to the newly connected client.  After
    // doing that, also want to notify all other currently connected
    // clients of the new player.
    //
    //------------------------------------------------------------------
    io.on('connection', function(socket) {
        console.log(`Connection established: ${socket.id}`);
        //
        // Create an entry in our list of connected clients
        let newPlayer = Player.create()
        newPlayer.id = socket.id;
        activeClients[socket.id] = {
            socket: socket,
            player: newPlayer
        };
        socket.emit('connect-ack', {
            direction: newPlayer.direction,
            center: newPlayer.center,
            size: newPlayer.size
        });

        socket.on('input', function(data) {
            inputQueue.push({
                id: socket.id,
                message: data,
            });
        });

        socket.on('disconnect', function() {
            delete activeClients[socket.id];
            notifyDisconnect(socket.id);
        });

        // Notify the other already connected clients of this new player
        notifyConnect(socket, newPlayer);
    });
}

//------------------------------------------------------------------
//
// Entry point to get the game started.
//
//------------------------------------------------------------------
function initialize(httpServer) {
    initializeSocketIO(httpServer);
    gameLoop(present(), 0);
}

//------------------------------------------------------------------
//
// Public function that allows the game simulation and processing to
// be terminated.
//
//------------------------------------------------------------------
function terminate() {
    this.quit = true;
}

module.exports.initialize = initialize;
