# Entity Interpolation

These examples build upon the client prediction examples by adding in the concept of _entity interpolation_.  The effect of enhancing the game with this technique is that of smooth updates of remotely connected clients.

These examples build upon the basic networking examples by adding in the concepts of [client prediction](https://en.wikipedia.org/wiki/Client-side_prediction) and server reconciliation.  The effect of enhancing the game with these techniques is that of a responsive and smooth game-play experience for a player providing inputs.

In [Step 2](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/Multiplayer-Step-2.md) the problem of stuttered or jerky motion of the local player controlled ship was solved.  However, nothing has been done about other remotely connected players in the game.  Let's look at another couple of diagrams to understand the problem.

Sequence Diagram | Timing Diagram
-----------------|---------------
![Entity Interpolation - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Interpolation%20Bad%20-%20Sequence.png) |  ![Entity Interpolation - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Entity%20Interpolation%20Bad%20-%20Timing.png)

...description coming...
