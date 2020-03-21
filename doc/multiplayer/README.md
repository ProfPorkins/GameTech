# Introduction to Multiplayer

The purpose of the multiplayer code samples in this repository is to provide an introduction to the issues and how to write code to deal with those issues.  This documentation and the code samples are only an introduction and does not represent everything needed to develop a fully robust and ready for the real-world game.  With that said, what is presented here goes a long way towards what is necessary.

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
  * Fastest possible delivery mechansim
* **TCP (Transmission Control Protocol)**
  * Reliable, guaranteed delivery; as long as connection stays alive
  * Stream oriented, no size limit on data
  * Connection oriented, state is preserved, requires some overhead
  * Relative to UDP, slower transmission of data

## Two Major Issues

Two major issues are discussed in the documentation and code samples, latency (lag) and Trust.  In simple terms, latency is related to the time it takes for a player to perform an input and see those results reflected on the screen.  There are many sources of latency in gaming, the one focused on here is with respect to network communication.  Trust in networked multiplayer games is paramount not only for consistent gameplay among players, but also in the face of those who like to compromise the gameplay through hacks and cheats.  The documentation and code samples here focus on latency, with a lesser focus on trust.

### Latency

There is a time cost for computers to coummunicate over a network.  For example a 'ping' from my computer to www.mit.edu shows a range of 26 to 30 ms.  There are multiple sources involved in this cost.  One is that the speed of light, while unbelievably fast in human terms, is a real constraint.  Between any two computers sharing a multiplayer network connection, there are any number of networking devices inbetween, hubs, routers, bridges, and who knows what else.  Each of these devices have buffers to temporarily hold incoming/outgoing data, along with time spent processing the data as it flows through.  Combining these and other sources of latency is large enough for players to notice if nothing is done to mitigate.

### Trust - Authority

An authoritative model or simulation of the game is necessary to provide a consistent game-play environment for all players.  It is also necessary to have any hope of of dealing with those who prefer to compromise game-play through cheats, hacks, or other means.  The samples presented in this repository only deal with the subject of an authoritative model to ensure a consistent game-play environment for all players.  The topic of dealing with cheats, hacks, and other sources of compromised game-play is not addressed.

## Techniques

The following techniques are discussed, along with code samples in both JavaScript and C++.

* Entity Component System
  * JavaScript - ECS
  * C++ - ECS
* Basic Multiplayer Networking
  * [JavaScript](../JavaScript/MultiPlayer/Step%201%20-%20Basic)
  * [C++](../C++/MultiPlayer/Step%201%20-%20Basic)
* Client Prediction & Server Reconciliation
  * JavaScript
  * C++
* Entity Interpolation
  * JavaScript
  * C++
* Entity Prediction
  * JavaScript
  * C++
* Weapons Example
  * JavaScript
  * C++

The ECS example for JavaScript is unrelated to the topic of networking, while the C++ example provides the code foundation for the networking examples.