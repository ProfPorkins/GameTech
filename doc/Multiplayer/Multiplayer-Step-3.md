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

With entity prediction we have made the movement of the player's controlled ship smooth and responsive, but are left with a stuttering or jerking movement for all other ships in the environment.  Entity prediction allows the player's ship to smoothly move from one position to another over time, but remote player controlled ships jump from one location to another.

Notice from both the above sequence and timing diagrams, the time at which Client B shows the updated location for the player at Client A is delayed quite a bit.  At time 80, Client B can process the move-forward input from Client A, that originally took place at time 10, with the visible movement displayed at time 90.

The (a) solution to this, and trust me, you aren't going to like it, is to _further_ delay the movement of the remote player controlled ships in order to smoothly move them from one position to the next.  Before we get to that, I want to change these diagrams a bit to show the time it takes to animate the ships from one position to the next.

Sequence Diagram | Timing Diagram
-----------------|---------------
![Entity Interpolation Animation - Sequence] |  ![Entity Interpolation Animation - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Interpolation%20Animation%20-%20Timing.png)

