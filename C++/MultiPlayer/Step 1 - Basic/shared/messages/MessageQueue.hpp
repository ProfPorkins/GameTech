#pragma once

#include "ConcurrentQueue.hpp"
#include "Message.hpp"

#include <SFML/Network.hpp>
#include <condition_variable>
#include <cstdint>
#include <functional>
#include <memory>
#include <mutex>
#include <thread>
#include <tuple>
#include <unordered_map>

namespace messages
{
    class MessageQueue
    {
      public:
        bool initializeServer(std::uint16_t listenPort, std::function<void(sf::Uint32)> onClientConnected);
        bool initializeClient(std::string serverIP, std::uint16_t serverPort);
        void shutdown();

        void sendMessage(sf::Uint32 clientId, std::shared_ptr<Message> message);

      private:
        bool m_keepRunning{true};
        std::thread m_threadListener;
        std::thread m_threadSender;
        std::thread m_threadReceiver;

        ConcurrentQueue<std::tuple<sf::Uint32, std::shared_ptr<Message>>> m_sendMessages;
        std::mutex m_mutexSendMessages;
        std::condition_variable m_eventSendMessages;
        std::mutex m_mutexEventSendMessages;

        ConcurrentQueue<std::tuple<sf::Uint32, std::shared_ptr<Message>>> m_receivedMessages;

        sf::SocketSelector m_selector;
        sf::TcpListener m_listener;
        std::function<void(sf::Uint32)> m_onClientConnected;
        std::unordered_map<sf::Uint32, std::unique_ptr<sf::TcpSocket>> m_sockets;
        std::unique_ptr<sf::TcpSocket> m_socketServer;
        std::mutex m_mutexSockets;

        void initializeListener(std::uint16_t listenPort);
        void initializeSender();
        void initializeReceiver();
        void initializeClientReceiver();
    };
} // namespace messages
