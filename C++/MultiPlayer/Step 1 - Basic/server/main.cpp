#include "GameModel.hpp"

#include <chrono>
#include <iostream>

int main()
{
    //
    // Get the game model initialized and ready to run
    GameModel model;

    //
    // Grab an initial time-stamp to get the elapsed time working
    auto previousTime = std::chrono::steady_clock::now();

    //
    // Get the application looprunning.  The game loop runs inside of this loop
    bool running = true;
    while (running)
    {
        //
        // Figure out the elapsed time in milliseconds.  Need this to pass on to
        // the game model.
        auto currentTime = std::chrono::steady_clock::now();
        auto elapsedTime = std::chrono::duration_cast<std::chrono::milliseconds>(currentTime - previousTime);
        previousTime = currentTime;

        //
        // Execute the game loop steps.  Because this is an ECS model, there is
        // only an update.  The typical processInput and render stages are turned
        // into systems, and those are updated during the model.update.
        model.update(elapsedTime);
    }

    return 0;
}
