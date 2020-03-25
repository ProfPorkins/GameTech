# Introduction to Multiplayer

The purpose of the multiplayer code samples in this repository is to provide an introduction to the issues and how to write code to deal with those issues.  This documentation and code samples are only an introduction and do not represent everything needed to develop a fully robust and ready for the real-world game.  With that said, what is presented here goes a long way towards what is necessary.

## Client-Server Model

The multiplayer networking model presented throughout is a client-server.  The server maintains the authoritative model of the game, while each client (player) connects to that server for participation.  There are other models for multiplayer networking, primarily peer-to-peer, but that is not addressed here.

## Terminology

The following terminology is useful to understand before working through the other documentation and code samples.

* **Server**
  * Runs the authoritative model/simulation of the game
  * Collects and processes inputs from connected clients
  * Sends game state updates to connected clients
* **Client**
  * Maintains a client perspective model of the game, based on local player inputs and game state updates from the server
  * Collects and sends inputs to the server
  Renders a local client view of the game state
* **Bandwidth**
  * Rate of data transfer over a given connection.  Often measured in bits-per-second (bps) or bytes-per-second (Bps)
* **Latency**
  * Time it takes to send and receive a packet between two networked devices (computers)
* **Jitter (in latency)**
  * Variation in latency.  The connection between two devices has variation in latency during a session.  For example, the latency might range between 15 and 30 milliseconds, spiking to over 200 milliseconds depending upon network conditions.
* **Connectionless**
  * Sending of messages without a prior arrangement or communication channel.  May result in loss of data.  e.g., UDP
* **Connection-Oriented**
  * Sending of messages over an established channel.  Usually a no data loss protocol.  e.g., TCP
* **UDP (User Datagram Protocol)**
  * Unreliable, not guarantee of delivery, no guarantee of delivery order
  * Packet oriented, limited (max) size per packet
  * Low overhead; around 28 bytes per packet
  * Fastest possible delivery mechanism
* **TCP (Transmission Control Protocol)**
  * Reliable, guaranteed delivery; as long as connection stays alive
  * Stream oriented, no size limit on data
  * Connection oriented, state is preserved, requires some overhead
  * Relative to UDP, slower transmission of data

## Two Major Issues

Two major issues are discussed in the documentation and code samples, latency (lag) and Trust.  In simple terms, latency is related to the time it takes for a player to perform an input and see those results reflected on the screen.  There are many sources of latency in gaming, the one focused on here is with respect to network communication.  Trust in networked multiplayer games is paramount not only for consistent gameplay among players, but also in the face of those who like to compromise the gameplay through hacks and cheats.  The documentation and code samples here focus on latency, with a lesser focus on trust.

### Latency

There is a time cost for computers to communicate over a network.  For example a 'ping' from my computer to www.mit.edu shows a range of 26 to 30 ms.  There are multiple sources involved in this cost.  One is that the speed of light, while unbelievably fast in human terms, is a real constraint.  Between any two computers sharing a multiplayer network connection, there are any number of networking devices in between, hubs, routers, bridges, and who knows what else.  Each of these devices have buffers to temporarily hold incoming/outgoing data, along with time spent processing the data as it flows through.  Combining these and other sources of latency is large enough for players to notice if nothing is done to mitigate.

Two UML diagrams show the source of latency and the source of that latency throughout.  The left image is a sequence diagram which shows the states, events, and messages that occur in a simple networked game.  The right image is a timing diagram which details the timing of the whole system, offering insight into how each component in the system contributes to latency.

Sequence Diagram | Timing Diagram
-----------------|---------------
![Basic Networking - Sequence](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Basic%20Network%20-%20Sequence.png) | ![Basic Networking - Timing](https://github.com/ProfPorkins/GameTech/blob/master/doc/Multiplayer/images/Basic%20Network%20-%20Timing.png)

Considering the sequence diagram: at the start both the client and server believe player 'p1' is located at position (0, 0).  The player gives an input to move the player forward.  During the update of the client-side game model a network message is sent to the server indicating a move-forward input request occurred.  After receiving the message, the server updates its game model, and now has 'p1' at position (0, 1); the client still believes 'p1' is at position (0, 0).  After the server game model is updated, the updated game state is sent to the client.  During the update of the client game model, the updated game state from the server is incorporated and the client now believes player 'p1' is at position (0, 1).

Considering the timing diagram (timing in milliseconds): The client is doing a full game loop every 10 ms (running at 100 frames per second), while the server is doing a full game loop every 20 ms (50 times per second).

1. Just prior to time 0 the player made an input to move forward.
1. During the first update a message is sent from the client to the server indicating this input.  The message is sent at time 10 and takes 12 ms to get to the server, arriving at time 22, too late to be incorporated into the second update which began at time 20.
1. During the third server update, beginning at time 40, the input message is processed, with the server game state now having player 'p1' at position (0, 1) at time 60.
1. At the end of the third update, a message is sent from the server to the client with the updated game state, taking 12 ms to travel, arriving at time 72, too late to be incorporated into the update that started at time 70.
1. The client update begging at time 80 incorporates the updated game state from the server and after it is complete, the client believes player 'p1' is at position (0, 1) right before time 90.

Looking at this diagram, we can see the player indicated movement forward at time 0 with that movement finally being reflected on their screen at time 90, almost a tenth of a second later.

### Trust - Authority

An authoritative model or simulation of the game is necessary to provide a consistent game-play environment for all players.  It is also necessary to have any hope of of dealing with those who prefer to compromise game-play through cheats, hacks, or other means.  The samples presented in this repository only deal with the subject of an authoritative model to ensure a consistent game-play environment for all players.  The topic of dealing with cheats, hacks, and other sources of compromised game-play is not addressed.

## Techniques

The following techniques are discussed, along with code samples in both JavaScript and C++.

* Entity Component System
  * [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/SnakeGame-ECS)
  * [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%200%20-%20ECS)
* Basic Multiplayer Networking
  * [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%201%20-%20Basic/)
  * [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%201%20-%20Basic/)
* Client Prediction & Server Reconciliation
  * [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%202%20-%20Client%20Prediction)
  * [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%202%20-%20Client%20Prediction)
* Entity Interpolation
  * [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%203%20-%20Entity%20Interpolation)
  * [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%203%20-%20Entity%20Interpolation)
* Entity Prediction
  * [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%204%20-%20Entity%20Prediction)
  * [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%204%20-%20Entity%20Prediction)
* Weapons Example
  * [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%205%20-%20Weapons)
  * [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%205%20-%20Weapons)

The ECS example for JavaScript is unrelated to the topic of networking, while the C++ example provides the code foundation for the networking examples.
