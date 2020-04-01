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
![Entity Interpolation Animation - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Interpolation%20Animation%20-%20Sequence.png) |  ![Entity Interpolation Animation - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Interpolation%20Animation%20-%20Timing.png)

In the timing diagram above I've tried to show the order of events and generally what happens.  Don't worry about the specific timing (millisecond) numbers along the bottom, it is the relative order among the two clients and server that is important.  In the description below the numbers are used for reference, but realize, the actual timing is almost certainly something else.  Detailing what takes place:

1. At time 10, the player at Client A creates a move-forward input, which is sent to the server.
1. At that same time, Client A uses client prediction to begin the animation of the ship from position (0, 0) to position (0, 1) over a period of 20 ms, finishing at time 30.
1. At time 30, the player at Client A generates another move-forward input, which is sent to the server.
1. At that same time, Client A uses client prediction to begin the animation of the ship from position (0, 1) to position (0, 2) over a period of 20 ms, finishing at time 50.
1. At time 40 the server has finished its processing and sends updated game states to both clients.
1. At time 50 both clients receive the updated game state.
   * Client A has already predicted this movement and has completed the animation.  In fact, it has already completed the animation for the 2nd input.
   * Client B receives the updated game state, but does nothing...yet.
1. At time 60 the server has finished its processing, which includes the 2nd move-forward input.  It sends the updated game state to both clients.
1. At time 70 both clients receive the updated game state.
   * Client A has already predicted this movement, having finished the animation of it at time 50.
   * Client B now begins animating the movement of the player from Client A from position (0, 0) to position (0, 1) over the next 20 ms, finishing at time 90.

I know, it seems crazy to wait so long to begin the animation of the player from Client A at Client B.  A couple of notes on this:

* When a client is receiving updates from the server 20 times per second (20 Hz), for many games and many players, it is hardly noticeable, if at all.
* Animation of the player from Client A at Client B _could_ begin at time 50, if the nature of the animation and its timing is known.  For example, a weapon reload animation has a fixed time to take place once it starts; that could start immediately upon notification.
* The next step in this series, Entity Prediction, enhances the networking model by having Client B predict where the player from Client A will be, based on momentum known at the time of receiving the update.  This allows Client B to begin animating the movement earlier.
* The techniques presented in this series are meant as a starting point for understanding how to write networked multiplayer games, not the end point.  There are a lot of approaches to dealing with the issues in (networked) multiplayer games and further (more advanced) techniques to use.  It also depends upon the specific game and its needs.

With all of the above said and the caveats noted, with the addition of this technique, all player controlled ships have smooth animation throughout; and it is pretty good.
