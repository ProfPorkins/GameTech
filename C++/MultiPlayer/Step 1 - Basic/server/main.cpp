#include "GameModel.hpp"

#include <chrono>
#include <google/protobuf/stubs/common.h>
#include <iostream>

int main()
{
    GOOGLE_PROTOBUF_VERIFY_VERSION;
    //
    // Get the game model initialized and ready to run
    GameModel model;

    //
    // Get the network message queue up and running
    if (!model.initializeMessageQueue())
    {
        std::cout << "Failed to initialize the message queue" << std::endl;
        exit(0);
    }

    //
    // Grab an initial time-stamp to get the elapsed time working
    auto previousTime = std::chrono::steady_clock::now();

    //
    // Get the server loop running.  The game loop runs inside of this loop
    auto running = bool{true};
    while (running)
    {
        //
        // Figure out the elapsed time in milliseconds.  Need this to pass on to
        // the game model.
        auto currentTime = std::chrono::steady_clock::now();
        auto elapsedTime = std::chrono::duration_cast<std::chrono::milliseconds>(currentTime - previousTime);
        previousTime = currentTime;

        //
        // Execute the game loop steps.  Because this is an ECS model, there is only an update.
        model.update(elapsedTime);
    }

    //
    // Gracefully shutdown the game model
    model.shutdown();
    //
    // Do the same for the Google Protocol Buffers library
    google::protobuf::ShutdownProtobufLibrary();

    return 0;
}
