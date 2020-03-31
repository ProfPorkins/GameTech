# Entity Interpolation

## Implementation Examples

* [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%203%20-%20Entity%20Interpolation)
* [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%203%20-%20Entity%20Interpolation)

## Introduction

These examples build upon the client prediction examples by adding in the concept of _entity interpolation_.  The effect of enhancing the game with this technique is that of smooth updates of remotely connected clients.

In [Step 2](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/Multiplayer-Step-2.md) the problem of stuttered or jerky motion of the local player controlled ship was solved.  However, nothing has been done about other remotely connected players in the game.  Let's look at another couple of diagrams to understand the problem.

Sequence Diagram | Timing Diagram
-----------------|---------------
![Entity Interpolation - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Interpolation%20Bad%20-%20Sequence.png) |  ![Entity Interpolation - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Interpolation%20Bad%20-%20Timing.png)

...description coming...
