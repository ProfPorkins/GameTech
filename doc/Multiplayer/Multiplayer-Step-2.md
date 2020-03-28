# Client Prediction & Server Reconciliation

These examples build upon the basic networking examples by adding in the concepts of [client prediction](https://en.wikipedia.org/wiki/Client-side_prediction) and server reconciliation.  The effect of enhancing the game with these techniques is that of a responsive and smooth game-play experience for a player providing inputs.

## Client Prediction

A client can trust itself, even if the server can't.  Therefore, a client can show response to an input before receiving an updated game state from the server.  Consider the sequence diagram below.

Sequence Diagram |
-----------------|
![Client Prediction - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Client%20Prediction-1%20-%20Sequence.png) |

Same as before, the player gives an input to move forward.  During the update of the client-side game model a network message is sent to the server indicating a move-forward input request.  This time, however, at the same time the server-side model is updating and incorporating the input request, the client-side model is _predicting_ the input being processed and acknowledged by the server. Then, when the server send an updated game state to the client, the client prediction is confirmed.

Let's look at the improvement in responsivness at the client by comparing the basic networking timing diagram with the client prediction timing diagram.

Networking Model | Timing Diagram
-----------------|---------------
Basic Networking | ![Basic Networking - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Basic%20Network%20-%20Timing.png)
Client Prediction | Basic Networking | ![Client Prediction - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Client%20Prediction-1%20-%20Timing.png)

## Server Reconciliation

Due to the time and delays in network communication, when a client receives an updated game state from the server, that game state may not include inputs already predicted by the client.  In order to deal with this, the client and server coordinate to track which inputs have been sent and processed.  When the
