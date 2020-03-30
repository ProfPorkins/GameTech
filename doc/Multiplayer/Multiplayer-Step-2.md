# Client Prediction & Server Reconciliation

These examples build upon the basic networking examples by adding in the concepts of [client prediction](https://en.wikipedia.org/wiki/Client-side_prediction) and server reconciliation.  The effect of enhancing the game with these techniques is that of a responsive and smooth game-play experience for a player providing inputs.

## Client Prediction

A client can trust itself, even if the server can't.  Therefore, a client can show response to an input before receiving an updated game state from the server.  Consider the sequence diagram below.

Sequence Diagram |
-----------------|
![Client Prediction - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Client%20Prediction%20-%20Sequence.png) |

Same as before, the player gives an input to move forward.  During the update of the client-side game model a network message is sent to the server indicating a move-forward input request.  This time, however, at the same time the server-side model is updating and incorporating the input request, the client-side model is _predicting_ the input being processed and acknowledged by the server. Then, when the server send an updated game state to the client, the client prediction is confirmed.

Let's look at the improvement in responsiveness at the client by comparing the basic networking timing diagram with the client prediction timing diagram.

Model | Timing Diagram
-----------------|---------------
Basic Networking | ![Basic Networking - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Basic%20Network%20-%20Timing.png)
Client Prediction | ![Client Prediction - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Client%20Prediction%20-%20Timing.png)

Because of the client prediction, the player sees a response to the input at time 20 versus at time 90 without, a difference of 70 ms.  That is a big deal!

## Server Reconciliation

All is well and good in the world with client prediction, right?  Consider the following sequence diagram.

Sequence Diagram | Timing Diagram
-----------------|---------------
![Client Prediction - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Client%20Prediction%20Bad%20-%20Sequence.png) |  ![Client Prediction - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Client%20Prediction%20Bad%20-%20Timing.png)

The start is the same as before.  The player gives an input to move forward, client predicts and server simulates.  This time, however, the player gives another input to move forward, before the server has responded with an updated game state.  The client also predicts this input, moving p1 to position (0, 2).  Importantly, before the server receives the second input, it has simulated the previous input and sends an updated state back to the client.  Upon receiving this update, the client moves p1 back to position (0, 1).  If that's not bad enough, the server then sends another update, with the second input simulated, which results in the client jumping p1 back to position (0, 2), Ugh!

As these diagrams illustrate, due to the time involved network communication, differing client and server model simulation rates, when a client receives an updated game state from the server, that game state may not include inputs already predicted by the client.  Naive processing of updated game states at the client result in a jerking back-and-forth movement.

The (a) solution to this problem is know as _server reconciliation_.  Some coordination is needed between the client and server.  When the client sends an input message to the server, it assigns an id to that message, and remembers the input associated with the id.  When the server responds with an updated game state, it includes the id of the last input it has processed; alternatively a list of all input ids it has processed (if unreliable communications).  When the client performs its next update, after receipt of an updated game state, it looks at the last message id the server has acknowledged and re-simulates those inputs after applying the updated game state from the server.  In doing this, the state at the client continues to be self-consistent, providing the player an expected experience.

The two diagrams below show the change in how the client works, along with the effect in the timing.

Sequence Diagram | Timing Diagram
-----------------|---------------
![Server Reconciliation - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Server%20Reconciliation%20-%20Sequence.png) |  ![Server Reconciliation - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Server%20Reconciliation%20-%20Timing.png)

* When the client sends an input, it assigns an id and includes that with the message.
* When the server responds with an updated game state, it acknowledges the last input message id it has processed as part of that game state.
* During the client's next update, it re-simulates any unacknowledged input messages sent to the server.
