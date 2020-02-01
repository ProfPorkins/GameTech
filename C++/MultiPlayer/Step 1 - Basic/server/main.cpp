#include "GameModel.hpp"

#include <SFML/Network.hpp>
#include <chrono>
#include <iostream>
#include <memory>
#include <thread>
#include <utility>

int main()
{
    //
    // Get the game model initialized and ready to run
    GameModel model;

    //
    // Initialize SFML TCP communication
    auto done = bool{false};
    std::thread thread = std::thread([&done, &model]() {
        sf::TcpListener listener;
        if (listener.listen(3000) != sf::Socket::Done)
        {
            std::cout << "error initializing network socket" << std::endl;
            exit(0);
        }
        else
        {
            std::cout << "successfully initialized sockets" << std::endl;
        }

        while (!done)
        {
            auto socket = std::make_unique<sf::TcpSocket>();
            if (listener.accept(*socket) != sf::Socket::Done)
            {
                std::cout << "error in accepting client connection" << std::endl;
            }
            else
            {
                std::cout << "new client connection accepted" << std::endl;
                model.clientConnected(std::move(socket));
            }
        }

        std::cout << "incoming network connection listener shutdown" << std::endl;
    });

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
    // Tell the incoming network connection thread to shutdown
    done = true;
    thread.join();

    return 0;
}
