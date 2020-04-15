# GameTech

This repository contains a collection of game programming techniques and samples, hence the name _*GameTech*_.  Throughout my life I've benefitted from documentation and code others have made publicly available, this is a small way for me to hopefully do the same for others.

## Update - 4/14/2019

The past couple of years I was distracted by working on a several years long side-project.  That project is now complete, I have now returned to working on code examples.

In late December of 2019 I have returned to working on these code samples.  Initially began by making some code updates to the existing samples first.  The first update was a small revision changing from the use of `var` to `let`.  Another was is a conversion from using tabs to spaces (I finally caved in!).  Others were larger in scope like the change in how keyboard input is handled, due to deprecation of `keyCode` on the keyboard event.  I also made some updates to the particle system that allow for changing particle size and color over time.

Once those updates were complete, I started working on a set of C++ multiplayer examples in January of 2020.  Those examples were mostly complete by mid-March.  Since that time I have been working on writing documentation to describe the multiplayer techniques used in both the JavaScript and C++ examples.  The general multiplayer documentation is complete, I'm now turning my attention to going through all the code examples and detailing the code techniques used.

Getting everything documented is a slow process, I expect that to take a few months, because at the same time I am working on a somewhat large private project.  Both the documentation and private project are being done in my _spare_ time, still have a day job to do.

## The Game Loop

A fundamental concept implemented in all of these examples is the so-called _game loop_.  At its simplest, the game loop is composed of three basic steps:

1. Process input
1. Update the game simulation
1. Render the game state

During the _process input_ stage any queued input is processed.  Input sources are many, but for most of these examples it comes from a user.  The multiplayer examples process network messages during this stage, as I consider them input; others may think differently.  Processing of input *does* modify the game simulation, therefore it is closely tied with the update stage.

The *update* stage is where the game simulation is updated.  For example, if an object in the game has momentum, the movement of that object is simulated in this stage.  AI controlled characters would _think_ in this stage and affect the game simulation.

Finally, the *render* stage takes the current state of the game simulation and renders it.

These examples make no attempt to parallelize the update and render stages, even though that can be done, and is done in games that need every ounce of performance.  For the JavaScript examples, it isn't reasonable to attempt something like that.  For the C++ examples performance isn't an issue, therefore not attempted.

### Entity-Component-System (ECS) Caveat

The C++ multiplayer examples are designed and implemented using the ECS architectural pattern.  This pattern changes the game loop in how it is implemented, but fundamentally the same steps are there.  In ECS there is _only_ and update stage.  During the update all systems are updated.  Two of those systems are _input_ and _render_.  When you look at the C++ examples, the update implementation looks like the following...

    systemNetwork.update();
    systemInput.update();
    systemMomentum.update();
    ...other systems updated...
    systemRender.update();

Again, the essential game loop is still there, but input and rendering are transformed into systems that get updated.