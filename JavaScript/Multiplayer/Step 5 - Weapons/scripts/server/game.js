// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------
'use strict';

let present = require('present');
let Player = require('./player');
let Missile = require('./missile');
let NetworkIds = require('../shared/network-ids');
let Queue = require('../shared/queue.js');

const SIMULATION_UPDATE_RATE_MS = 50;   // How often to update the simulation (in ms)
let quit = false;
let activeClients = {};
let newMissiles = [];
let activeMissiles = [];
let hits = [];
let inputQueue = Queue.create();
let nextMissileId = 1;
let lastUpdateTime = present();

//------------------------------------------------------------------
//
// Used to create a missile in response to user input.
//
//------------------------------------------------------------------
function createMissile(clientId, playerModel) {
    let directionVectorX = Math.cos(playerModel.direction);
    let directionVectorY = Math.sin(playerModel.direction);

    let missile = Missile.create({
        id: nextMissileId++,
        clientId: clientId,
        center: {
            x: playerModel.center.x,
            y: playerModel.center.y
        },
        momentum: {
            x: directionVectorX * 0.0003 + playerModel.momentum.x,
            y: directionVectorY * 0.0003 + playerModel.momentum.y,
        },
        radius: 0.0025, // In world coordinates
        timeRemaining: 1500 // milliseconds
    });

    newMissiles.push(missile);
}

//------------------------------------------------------------------
//
// Utility function to perform a hit test between two objects.  The
// objects must have a center: { x: , y: } property and radius property.
//
//------------------------------------------------------------------
function collided(obj1, obj2) {
    let distance = Math.sqrt(Math.pow(obj1.center.x - obj2.center.x, 2) + Math.pow(obj1.center.y - obj2.center.y, 2));
    let radii = obj1.radius + obj2.radius;

    return distance <= radii;
}

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
    inputQueue = Queue.create();

    while (!processMe.empty) {
        let input = processMe.dequeue();
        let client = activeClients[input.clientId];
        client.lastMessageId = input.message.id;
        switch (input.message.type) {
            case NetworkIds.INPUT_THRUST:
                // Need to compute the difference since the last update and when the thrust
                // input was received.  This time difference needs to be simulated before the
                // thrust input is processed in order to keep the client and server thinking
                // the same thing about the player's ship.
                client.player.thrust(input.message.elapsedTime, input.receiveTime - lastUpdateTime);
                lastUpdateTime = input.receiveTime;
                break;
            case NetworkIds.INPUT_ROTATE_LEFT:
                client.player.rotateLeft(input.message.elapsedTime);
                break;
            case NetworkIds.INPUT_ROTATE_RIGHT:
                client.player.rotateRight(input.message.elapsedTime);
                break;
            case NetworkIds.INPUT_FIRE:
                createMissile(input.clientId, client.player);
                break;
        }
    }
}

//------------------------------------------------------------------
//
// Update the simulation of the game.
//
//------------------------------------------------------------------
function update(elapsedTime) {
    for (let id in activeClients) {
        activeClients[id].player.update(elapsedTime, false);
    }

    for (let missile = 0; missile < newMissiles.length; missile++) {
        newMissiles[missile].update(elapsedTime);
    }

    let keepMissiles = [];
    for (let missile = 0; missile < activeMissiles.length; missile++) {
        //
        // If update returns false, that means the missile lifetime ended and
        // we don't keep it around any longer.
        if (activeMissiles[missile].update(elapsedTime)) {
            keepMissiles.push(activeMissiles[missile]);
        }
    }
    activeMissiles = keepMissiles;

    //
    // Check to see if any missiles collide with any players (no friendly fire)
    keepMissiles = [];
    for (let missile = 0; missile < activeMissiles.length; missile++) {
        let hit = false;
        for (let clientId in activeClients) {
            //
            // Don't allow a missile to hit the player it was fired from.
            if (clientId !== activeMissiles[missile].clientId) {
                if (collided(activeMissiles[missile], activeClients[clientId].player)) {
                    hit = true;
                    hits.push({
                        clientId: clientId,
                        missileId: activeMissiles[missile].id,
                        center: activeClients[clientId].player.center
                    });
                }
            }
        }
        if (!hit) {
            keepMissiles.push(activeMissiles[missile]);
        }
    }
    activeMissiles = keepMissiles;
}

//------------------------------------------------------------------
//
// Send state of the game to any connected clients.
//
//------------------------------------------------------------------
function updateClients(elapsedTime) {
    //
    // Build the missile messages one time, then reuse inside the loop
    let missileMessages = [];
    for (let item = 0; item < newMissiles.length; item++) {
        let missile = newMissiles[item];
        missileMessages.push({
            id: missile.id,
            direction: missile.direction,
            center: {
                x: missile.center.x,
                y: missile.center.y
            },
            radius: missile.radius,
            momentum: missile.momentum,
            timeRemaining: missile.timeRemaining
        });
    }

    //
    // Move all the new missiles over to the active missiles array
    for (let missile = 0; missile < newMissiles.length; missile++) {
        activeMissiles.push(newMissiles[missile]);
    }
    newMissiles.length = 0;

    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        let update = {
            clientId: clientId,
            lastMessageId: client.lastMessageId,
            momentum: client.player.momentum,
            direction: client.player.direction,
            center: client.player.center,
            updateWindow: elapsedTime
        };
        if (client.player.reportUpdate) {
            client.socket.emit(NetworkIds.UPDATE_SELF, update);

            //
            // Notify all other connected clients about every
            // other connected client status...but only if they are updated.
            for (let otherId in activeClients) {
                if (otherId !==clientId) {
                    activeClients[otherId].socket.emit(NetworkIds.UPDATE_OTHER, update);
                }
            }
        }

        //
        // Report any new missiles to the active clients
        for (let missile = 0; missile < missileMessages.length; missile++) {
            client.socket.emit(NetworkIds.MISSILE_NEW, missileMessages[missile]);
        }

        //
        // Report any missile hits to this client
        for (let hit = 0; hit < hits.length; hit++) {
            client.socket.emit(NetworkIds.MISSILE_HIT, hits[hit]);
        }
    }

    for (let clientId in activeClients) {
        activeClients[clientId].player.reportUpdate = false;
    }

    //
    // Don't need these anymore, clean up
    hits.length = 0;

    lastUpdateTime = present();
}

//------------------------------------------------------------------
//
// Server side game loop
//
//------------------------------------------------------------------
function gameLoop(currentTime, elapsedTime) {
    processInput();
    update(elapsedTime, currentTime);
    updateClients(elapsedTime);

    if (!quit) {
        setTimeout(() => {
            let now = present();
            gameLoop(now, now - currentTime);
        }, SIMULATION_UPDATE_RATE_MS);
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
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (newPlayer.clientId !== clientId) {
                //
                // Tell existing about the newly connected player
                client.socket.emit(NetworkIds.CONNECT_OTHER, {
                    clientId: newPlayer.clientId,
                    momentum: newPlayer.momentum,
                    direction: newPlayer.direction,
                    center: newPlayer.center,
                    size: newPlayer.size,
                    rotateRate: newPlayer.rotateRate,
                    thrustRate: newPlayer.thrustRate
                });

                //
                // Tell the new player about the already connected player
                socket.emit(NetworkIds.CONNECT_OTHER, {
                    clientId: client.player.clientId,
                    momentum: client.player.momentum,
                    direction: client.player.direction,
                    center: client.player.center,
                    size: client.player.size,
                    rotateRate: client.player.rotateRate,
                    thrustRate: client.player.thrustRate,
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
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (playerId !== clientId) {
                client.socket.emit(NetworkIds.DISCONNECT_OTHER, {
                    clientId: playerId
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
        let newPlayer = Player.create();
        newPlayer.clientId = socket.id;
        activeClients[socket.id] = {
            socket: socket,
            player: newPlayer
        };
        socket.emit(NetworkIds.CONNECT_ACK, {
            momentum: newPlayer.momentum,
            direction: newPlayer.direction,
            center: newPlayer.center,
            size: newPlayer.size,
            rotateRate: newPlayer.rotateRate,
            thrustRate: newPlayer.thrustRate
        });

        socket.on(NetworkIds.INPUT, function(data) {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data,
                receiveTime: present()
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
