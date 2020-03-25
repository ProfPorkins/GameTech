# Basic Networking

The code for this example demonstrates basic networking for a multiplayer game.  This is a client collecting inputs, sending those inputs to the server, the server processing the inputs, and then sending an updated game state back to the client, which the client then incorporates into its model, and then renders.  The UML sequence diagram below details the steps:

Sequence Diagram |
-----------------|
![Step 1 - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Step%201%20-%20Sequence.png) |

## Client Model

The client model is simple only tracking the position and orientation of each player in the game.  As network messages come in from the server with updated states, the player states are updated.

## Server Model

The server model is the authoritative state of the game.  All information about the players in the game are known and updated based on inputs from the connected clients.

## Game Loops

Both the client and server run a game loop, along with each maintaining their own model of the game.  The game loop for both follows a similar pattern, but not exactly the same.  The client has a render step, which the server doesn't.  The server has a step to send out the updated game state, which the client doesn't.

### Client Game Loop

    while true
        Process Input
        Update Model
        Render

There are two types of inputs received by the client.  The first is the keyboard inputs from the player.  The keyboard inputs are transformed by an actual key, like 'w' to a semantic input like 'move-forward'.  The second input type is the network messages sent from the server, containing updated game state details.  Both are processed during the 'Process Input' stage.  Processing of these inputs result in an update game model.

For this example, the 'Update Model' stage has nothing to do.  It is stubbed in because it is needed in future steps.

The 'Render' stage takes the current state of the game models and renders it.

### Server Game Loop

    while true
        Process Input
        Update Model
        Update Clients

Inputs at the server are the network messages sent from clients which contain the semantic inputs from the players.  These inputs are processed and used to update the model.

Similar to the client, the 'Update Model' stage has nothing to do.  It is stubbed in because it is needed in future steps.

The 'Update Clients' stage sends the updated state of the server-side model to the connected clients.

## Implementation Details

* [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%201%20-%20Basic)
* [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%201%20-%20Basic)
