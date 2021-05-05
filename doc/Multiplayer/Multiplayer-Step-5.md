# Weapons

## Implementation Examples

* [JavaScript](https://github.com/ProfPorkins/GameTech/tree/master/JavaScript/Multiplayer/Step%205%20-%20Weapons)
* [C++](https://github.com/ProfPorkins/GameTech/tree/master/C%2B%2B/Multiplayer/Step%205%20-%20Weapons)

## Introduction

These examples demonstrate the addition of weapons into the game.  Specifically weapons that result in a particle or missile that travels over time, has a lifetime, and cause damage when they collide with another object.

Returning back to the topic of trust and authority in a networked multiplayer game, a client cannot be very well trusted.  About the only thing the server can accept from a client is inputs caused by the player.  One of the inputs a player may perform is the firing of a weapon.

Because clients can't be trusted, the client doesn't inform the server a weapon has been fired, instead, the client informs the server an weapon firing input was given.  Based on that input and other validation as seen necessary by the server, the server simulation decided whether or not a weapon was actually fired.  Similarly, a client doesn't inform the server if a weapon hits another object and causes damage; because of (lack of) trust.  Instead, the server models the weapon projectile and determines when/if a collision occurs and the resulting damage.  When this happens, the server sends a message to connected clients about the collision, an explosions, etc.

Let's take a look at the sequence of events that occur during the firing and tracking of a weapon and the projectile.


Sequence Diagram |
-----------------|
![Weapon Firing - Sequence](https://github.com/ProfPorkins/GameTech/blob/trunk/doc/Multiplayer/images/Weapon%20Firing%20-%20Sequence.png) |

Stepping through this diagram we see the following key elements...

1. At some time the player at Client A generate an fire-weapon input.  The client sends this input to the server.  The client takes no local game model action based this input.
1. The server receives the input event, validates it, and accepts it.  The server's authoritative game simulation updates, incorporating the weapon firing event.
1. The server sends updated game states to both clients, with the newly generated projectile.
1. Both clients receive the updated game states, which includes the information about the weapon firing and the newly created projectile.  Both clients begin local model tracking of the projectile, including rendering.
1. The server detects a collision between the projectile and p2.
1. The server sends updated game states to both clients, with the projectile hit information.
1. Both clients begin animating an explosion (where the server indicated) and remove the projectile from their local model tracking.
   * The server update includes details on the location of the hit.  The client animates the explosion where the server indicates, not from the local tracking.  Even though clients do local tracking of the projectile, they never test for collision themselves.

Not shown in this diagram (or the code examples): The client could predict the weapon firing and being displaying the projectile, before the server has recognized the weapon discharge.  As long as the server accepts the input and sends an updated game state with the weapon firing, all is okay.  But if the server rejects the input and never indicates the weapon firing event, it leaves the client having incorrectly predicted an event, leaving the player with an incorrect view of the actual game simulation.  Have to be careful with this kind of a prediction, but not impossible to do.

Similarly, the client could predict a projectile collision and begin an explosion animation.  As long as the server quickly updates with that same information, all is okay.  But if the client mispredicts the hit, and that can easily occur, again, the player is left with an incorrect view of the actual game simulation.
