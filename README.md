# GameTech
Game programming samples and techniques

12/29/2019 - Update

For the past couple of years was distracted by working on a several years long side-project.  That project is now complete and I'm ready, and excited, to return to working on this.

Recently I have returned to working on these code samples.  Some have small revisions like changing from the use of `var` to `let`.  Another is a conversion from using tabs to spaces (I finally caved in!).  Some have larger scope like the change in how keyboard input is handled, due to deprecation of `keyCode` on the keyboard event.  There are some other changes I'd like to make to the code, for example, adding additional capabilities to the particle system.  But for the most part, my intention is to add several significant new JavaScript demos, and then add some C++ demos.  Some of the C++ demos will have overlap with the JavaScript demos, but the purpose is not to creating a matching set of JavaScript/C++ demos.  Instead, I have a longer-term goal to build up to a small research like project I want/need to do in C++.

The following are some of the additions I plan on adding to this repository over the coming (many) months...

* (JavaScript - completed 1/4/2020) Update the particle system example to allow particles to change size over time, also change transparency over time.
* (JavaScript - completed 1/12/2020) Add a set of multiplayer network examples.
* (JavaScript - completed 1/18/2020) Add an Entity-Component-System example.
* (C++ - in progress) Add a set of multiplayer network examples.
* (C++ - in progress) Add an Entity-Component-System example.
* (C++) Add a modest research project.

As of 1/18/2020 the JavaScript examples are complete.  Although, there is no such thing as complete, I'm certain to revisit the code making various improvements and additions over time, but the focus now is building the C++ demos.

The multiplayer network examples are being written using the ECS model.  Therefore, there won't be separate multi-player and ECS examples, they are both the same thing.  With that said, it is possible I might make a non-multiplayer example that is ECS only, in order to focus on a C++ ECS implementation without also mixing in multiplayer networking.

The research project, it exists in design only, it will be worked on after completing most of these other examples.  As I work on the C++ examples, will likely add more to the list.  The internet is full of examples of rendering, etc, I'm not wanting to re-create those, instead want to create examples for techniques that are less commonly found; particularly the multi-player networking techniques.
