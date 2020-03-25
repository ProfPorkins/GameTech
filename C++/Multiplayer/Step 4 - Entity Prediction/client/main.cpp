#include "GameModel.hpp"
#include "MessageQueueClient.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/Window.hpp>
#include <chrono>
#include <iostream>
#include <memory>
#include <string>

std::shared_ptr<sf::RenderWindow> prepareWindow()
{
    //
    // Create the window : The settings parameter isn't necessary for what I'm doing, but leaving it here for reference
    sf::ContextSettings settings;

    // Landscape windows
    //auto window = std::make_shared<sf::RenderWindow>(sf::VideoMode(640, 480), "Multiplayer - Step 4: Entity Prediction", sf::Style::Titlebar | sf::Style::Close, settings);
    //auto window = std::make_shared<sf::RenderWindow>(sf::VideoMode(800, 600), "Multiplayer - Step 4: Entity Prediction", sf::Style::Titlebar | sf::Style::Close, settings);
    //auto window = std::make_shared<sf::RenderWindow>(sf::VideoMode(1024, 768), "Multiplayer - Step 4: Entity Prediction", sf::Style::Titlebar | sf::Style::Close, settings);
    auto window = std::make_shared<sf::RenderWindow>(sf::VideoMode(1920, 1080), "Multiplayer - Step 4: Entity Prediction", sf::Style::Titlebar | sf::Style::Close, settings);

    // Vertical windows
    //auto window = std::make_shared<sf::RenderWindow>(sf::VideoMode(600, 800), "Multiplayer - Step 4: Entity Prediction", sf::Style::Titlebar | sf::Style::Close, settings);
    //auto window = std::make_shared<sf::RenderWindow>(sf::VideoMode(1080, 1920), "Multiplayer - Step 4: Entity Prediction", sf::Style::Titlebar | sf::Style::Close, settings);

    window->setVerticalSyncEnabled(true);

    return window;
}

void prepareView(std::shared_ptr<sf::RenderWindow> window)
{
    //
    // The aspect ratio is needed in order to know how to organize the viewport
    // for the "game play" area used for the demonstrations.
    auto aspectRatio = static_cast<float>(window->getSize().x) / window->getSize().y;

    // Want the view to be a rectangular section of the window
    sf::View view(sf::Vector2f(0.0, 0.0), {1.0f, 1.0f});
    if (aspectRatio > 1.0)
    {
        auto extra = (1.0f - (1.0f / aspectRatio)) / 2.0f;
        view.setViewport(sf::FloatRect(extra, 0.0, 1.0f - extra * 2, 1.0f));
    }
    else
    {
        auto extra = (1.0f - aspectRatio) / 2.0f;
        view.setViewport({0.0f, extra, 1.0f, 1.0f - extra * 2});
    }
    // Have to set the view after preparing it
    window->setView(view);
}

int main()
{
    //
    // Create and activate the window for rendering on the main thread
    auto window = prepareWindow();
    prepareView(window);
    window->setActive(true);

    if (!MessageQueueClient::instance().initialize("127.0.0.1", 3000))
    {
        std::cout << "Failed to initialize connection to the server, terminating..." << std::endl;
        exit(0);
    }

    //
    // Get the game model initialized and ready to run
    GameModel model;
    if (!model.initialize({window->getView().getSize().x, window->getView().getSize().y}))
    {
        std::cout << "Game model failed to initialize, terminating..." << std::endl;
        exit(0);
    }

    //
    // Grab an initial time-stamp to get the elapsed time working
    auto previousTime = std::chrono::steady_clock::now();

    //
    // Get the Window loop running.  The game loop runs inside of this loop
    bool running = true;
    while (running)
    {
        //
        // Figure out the elapsed time in microseconds.  Need this to pass on to
        // the game model.
        auto currentTime = std::chrono::steady_clock::now();
        auto elapsedTime = std::chrono::duration_cast<std::chrono::microseconds>(currentTime - previousTime);
        previousTime = currentTime;

        // Handle all pending Windows events
        sf::Event event;
        while (window->pollEvent(event))
        {
            if (event.type == sf::Event::Closed)
            {
                // end the program
                running = false;
            }

            if (event.type == sf::Event::KeyPressed)
            {
                model.signalKeyPressed(event.key, elapsedTime);
            }
            if (event.type == sf::Event::KeyReleased)
            {
                model.signalKeyReleased(event.key, elapsedTime);
            }
        }

        //
        // Execute the game loop steps.  Because this is an ECS model, there is
        // only an update.  The typical processInput and render stages are turned
        // into systems, and those are updated during the model.update.
        model.update(elapsedTime, window);

        //
        // BUT, we still wait until here to display the window...this is what actually
        // causes the rendering to occur.
        window->display();
    }

    MessageQueueClient::instance().shutdown();

    return 0;
}
