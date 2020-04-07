# Entity Prediction

## Implementation Examples

* [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%204%20-%20Entity%20Prediction)
* [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%204%20-%20Entity%20Prediction)

## Introduction

These examples builds on the entity interpolation examples by adding in the concept of _entity prediction_.  The effect of enhancing the game with this technique is that of allowing both player controlled and remotely connected client ships to continue to move without receiving updates from the server.

A space ship has momentum and continues to move regardless of input from a player.  Therefore, a client can (must) predict where a ship is moving without any inputs from the local user or state updates from the server (for remote players).  Consider the following sequence diagram.

Sequence Diagram |
-----------------|
![Entity Interpolation - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Prediction%20-%20Sequence.png) |

...more to come...