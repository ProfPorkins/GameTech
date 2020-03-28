# Client Prediction & Server Reconciliation

These examples build upon the basic networking examples by adding in the concepts of [client prediction](https://en.wikipedia.org/wiki/Client-side_prediction) and server reconciliation.  The effect of enhancing the game with these techniques is that of a responsive and smooth game-play experience for a player providing inputs.

Client Prediction
: A client can trust itself, even if the server can't.  Therefore, a client can show response to an input before receiving an updated game state from the server.  

 Server Reconciliation
: Due to the time and delays in network communication, when a client receives an updated game state from the server, that game state may not include inputs already predicted by the client.  In order to deal with this, the client and server coordinate to track which inputs have been sent and processed.  When the
