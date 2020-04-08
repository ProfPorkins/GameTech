# Entity Prediction

## Implementation Examples

* [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%204%20-%20Entity%20Prediction)
* [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%204%20-%20Entity%20Prediction)

## Introduction

These examples build on the entity interpolation examples by adding in the concept of _entity prediction_.  The effect of enhancing the game with this technique is that of allowing both player controlled and remotely connected client ships to continue to move without receiving updates from the server.

A space ship has momentum and continues to move regardless of input from a player.  This requires a change from the concept of a "move forward" input to a "thrust" input which adds momentum to the ship in the direction of orientation.  With the concept of momentum, a client can (must) predict where a ship is moving, without continuous inputs from the local user or state updates from the server (for remote players).  Consider the following sequence diagram.

Sequence Diagram |
-----------------|
![Entity Interpolation - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Prediction%20-%20Sequence.png) |

Stepping through this diagram we see the following key elements...

1. The server simulation rate is half that of the client.  For example, the client might be simulating 60 times per second, while the server is simulating 30 times per second.
1. (ClientA) Immediately after the user provides a thrust input, the player's ship movement can be predicted based on momentum, moving the ship to (0, 1).  At the same time, the thrust input is sent to the server.
1. (Server) Receives the thrust input from ClientA, updates the ship momentum based on the thrust and begins simulating movement based on the momentum.  Due to the slower simulation rate, more movement occurs.
1. (ClientA) Another simulation step, moving the ship to (0, 2).
1. (Server) Sends updated game state to both ClientA and ClientB
1. (ClientA) Receives the updated game state and reconciles the authoritative momentum from the server.  Movement of the ship is predicted, moving to (0, 3).
1. (ClientB) At the same time as ClientA, momentum is updated from the server for ClientA's ship, and movement is predicted to (0, 1).
1. (Server) At the same time as ClientA and ClientB, the server simulates its next step, moving ClientA's ship to (0, 4).
1. (ClientA) Based on momentum predicts the ship moving to (0, 4).
1. (ClientB) At the same time as ClientA, predicts the ship moving to (0, 2).
1. (Server) Sends updated game state to both ClientA and ClientB
1. (ClientA) Receives the updated game state and reconciles the authoritative momentum from the server.  Movement of the ship is predicted, moving to (0, 5).
1. (ClientB) At the same time as ClientA, momentum is updated from the server for ClientA's ship, and movement is predicted to (0, 3).
